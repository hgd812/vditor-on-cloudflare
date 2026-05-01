export default {
  async fetch(request) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // 处理实际的 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    try {
      const formData = await request.formData();
      const files = formData.getAll('file[]');
      const succMap = {};
      const errFiles = [];
      for (const file of files) {
        if (file instanceof File) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            const mime = file.type || 'application/octet-stream';
            succMap[file.name] = `data:${mime};base64,${base64}`;
          } catch {
            errFiles.push(file.name);
          }
        }
      }
      const data = {
        msg: '',
        code: 0,
        data: { errFiles, succMap }
      };
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ msg: e.message, code: 1, data: null }), {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};