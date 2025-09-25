addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const referer = request.headers.get('Referer') || ''
  const refParam = url.searchParams.get('ref')
  
  // 特殊路径：查看最新日志记录
  if (url.pathname === '/latest-logs') {
    return handleLatestLogs(request)
  }
  
  // 只记录主域名访问（根路径或带参数）
  const shouldLog = url.pathname === '/' || url.search !== ''
  
  // 准备日志数据
  const logData = {
    timestamp: new Date().toISOString(),
    url: request.url,
    referer: referer,
    userAgent: request.headers.get('User-Agent') || '',
    ip: request.headers.get('CF-Connecting-IP') || '',
    country: request.cf?.country || '',
    refParam: refParam
  }
  
  // 检查跳转条件：ref=ppp 且 Referer 不为空
  if (refParam === 'ppp' && referer.trim() !== '') {
    // 同时记录到两个表
    if (shouldLog) {
      await Promise.all([
        logToKV(logData, 'REDIRECT_TO_FIVERR', 'REDIRECT_LOGS'),
        logToKV(logData, 'REDIRECT_ACCESS', 'ALL_ACCESS')
      ])
    }
    
    // 302 跳转到 Fiverr
    return new Response('', {
      status: 302,
      headers: {
        'Location': 'https://go.fiverr.com/visit/?bta=1144956&brand=fp',
        'Cache-Control': 'no-cache'
      }
    })
  }
  
  // 记录所有主域名访问到 ALL_ACCESS
  if (shouldLog) {
    await logToKV(logData, 'NORMAL_ACCESS', 'ALL_ACCESS')
  }
  
  // 正常访问，返回 GitHub Pages 内容
  return fetch(request)
}

async function logToKV(logData, action, kvNamespace) {
  try {
    const now = Date.now()
    const timestamp = new Date().toISOString()
    
    // 使用反向时间戳作为key前缀，确保最新记录排在前面
    // 9999999999999 - 当前时间戳 = 反向时间戳
    const reverseTimestamp = 9999999999999 - now
    const logKey = `${String(reverseTimestamp).padStart(13, '0')}_${Math.random().toString(36).substring(2, 8)}`
    
    const logEntry = {
      action: action,
      sortTime: now,
      displayTime: timestamp,
      ...logData
    }
    
    // 根据 namespace 名称选择对应的 KV
    const kv = kvNamespace === 'REDIRECT_LOGS' ? REDIRECT_LOGS : ALL_ACCESS
    
    // 存储日志记录
    await kv.put(logKey, JSON.stringify(logEntry), {
      expirationTtl: 30 * 24 * 60 * 60 // 30天过期
    })
    
    // 更新最新记录索引（保存最新的10条记录的key）
    const indexKey = `${kvNamespace}_LATEST_INDEX`
    let latestIndex = []
    
    try {
      const existingIndex = await kv.get(indexKey)
      if (existingIndex) {
        latestIndex = JSON.parse(existingIndex)
      }
    } catch (e) {
      console.warn('Failed to parse existing index:', e)
    }
    
    // 添加新记录到索引开头
    latestIndex.unshift({
      key: logKey,
      timestamp: now,
      displayTime: timestamp,
      action: action
    })
    
    // 保留最新的50条记录索引
    latestIndex = latestIndex.slice(0, 50)
    
    // 更新索引
    await kv.put(indexKey, JSON.stringify(latestIndex), {
      expirationTtl: 30 * 24 * 60 * 60 // 30天过期
    })
    
    console.log(`Logged ${action} to ${kvNamespace}:`, logEntry)
  } catch (error) {
    console.error(`Failed to log to ${kvNamespace}:`, error)
  }
}

async function handleLatestLogs(request) {
  try {
    const url = new URL(request.url)
    const kvType = url.searchParams.get('kv') || 'redirect' // redirect 或 all
    const limit = parseInt(url.searchParams.get('limit')) || 20
    
    const kvNamespace = kvType === 'all' ? 'ALL_ACCESS' : 'REDIRECT_LOGS'
    const kv = kvNamespace === 'REDIRECT_LOGS' ? REDIRECT_LOGS : ALL_ACCESS
    const indexKey = `${kvNamespace}_LATEST_INDEX`
    
    // 获取最新记录索引
    const indexData = await kv.get(indexKey)
    if (!indexData) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No logs found',
        logs: []
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    }
    
    const latestIndex = JSON.parse(indexData)
    const logsToFetch = latestIndex.slice(0, limit)
    
    // 并行获取日志详情
    const logPromises = logsToFetch.map(async (indexItem) => {
      try {
        const logData = await kv.get(indexItem.key)
        return logData ? JSON.parse(logData) : null
      } catch (e) {
        console.error('Failed to fetch log:', indexItem.key, e)
        return null
      }
    })
    
    const logs = (await Promise.all(logPromises)).filter(log => log !== null)
    
    // 构建HTML响应
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>最新访问日志 - ${kvType === 'all' ? '所有访问' : '重定向记录'}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; margin-bottom: 10px; }
            .nav { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 6px; }
            .nav a { margin-right: 15px; padding: 8px 16px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
            .nav a.active { background: #28a745; }
            .stats { display: flex; gap: 20px; margin: 20px 0; }
            .stat { background: #e9ecef; padding: 15px; border-radius: 6px; text-align: center; flex: 1; }
            .log-entry { border: 1px solid #e0e0e0; margin-bottom: 10px; border-radius: 6px; overflow: hidden; }
            .log-header { background: #f8f9fa; padding: 12px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
            .log-body { padding: 15px; }
            .redirect { border-left: 4px solid #28a745; }
            .normal { border-left: 4px solid #17a2b8; }
            .field { margin: 8px 0; }
            .field strong { display: inline-block; width: 120px; color: #666; font-size: 14px; }
            .field span { font-family: monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px; }
            .country { background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
            .action-redirect { background: #d4edda; color: #155724; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
            .action-normal { background: #d1ecf1; color: #0c5460; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
            .refresh { margin: 20px 0; text-align: center; }
            .refresh button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 WorkSkillPro 访问日志</h1>
            <p>实时监控访问和重定向记录</p>
            
            <div class="nav">
                <a href="?kv=redirect&limit=20" class="${kvType === 'redirect' ? 'active' : ''}">重定向记录</a>
                <a href="?kv=all&limit=20" class="${kvType === 'all' ? 'active' : ''}">所有访问</a>
                <a href="?kv=${kvType}&limit=50">显示50条</a>
                <a href="?kv=${kvType}&limit=100">显示100条</a>
            </div>
            
            <div class="stats">
                <div class="stat">
                    <div style="font-size: 24px; font-weight: bold; color: #28a745;">${logs.filter(l => l.action.includes('REDIRECT')).length}</div>
                    <div>重定向次数</div>
                </div>
                <div class="stat">
                    <div style="font-size: 24px; font-weight: bold; color: #17a2b8;">${logs.filter(l => l.action.includes('NORMAL')).length}</div>
                    <div>普通访问</div>
                </div>
                <div class="stat">
                    <div style="font-size: 24px; font-weight: bold; color: #6c757d;">${logs.length}</div>
                    <div>总记录数</div>
                </div>
            </div>
            
            <div class="refresh">
                <button onclick="window.location.reload()">🔄 刷新数据</button>
            </div>
            
            <div class="logs">
                ${logs.map(log => `
                    <div class="log-entry ${log.action.includes('REDIRECT') ? 'redirect' : 'normal'}">
                        <div class="log-header">
                            <span class="${log.action.includes('REDIRECT') ? 'action-redirect' : 'action-normal'}">
                                ${log.action.includes('REDIRECT') ? '🎯 重定向到Fiverr' : '👁️ 正常访问'}
                            </span>
                            <span>${log.displayTime}</span>
                        </div>
                        <div class="log-body">
                            <div class="field"><strong>访问URL:</strong> <span>${log.url}</span></div>
                            <div class="field"><strong>来源页面:</strong> <span>${log.referer || '直接访问'}</span></div>
                            <div class="field"><strong>IP地址:</strong> <span>${log.ip}</span> <span class="country">${log.country || '未知'}</span></div>
                            <div class="field"><strong>用户代理:</strong> <span>${log.userAgent.substring(0, 100)}${log.userAgent.length > 100 ? '...' : ''}</span></div>
                            ${log.refParam ? `<div class="field"><strong>Ref参数:</strong> <span>${log.refParam}</span></div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <script>
            // 每30秒自动刷新
            setTimeout(() => {
                window.location.reload();
            }, 30000);
        </script>
    </body>
    </html>
    `
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 200
    })
    
  } catch (error) {
    console.error('Failed to fetch latest logs:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
}