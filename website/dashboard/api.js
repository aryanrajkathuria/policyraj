// Thin client over the three Lambda Function URLs.
const Api = (() => {
  const cfg = DASHBOARD_CONFIG;

  const call = async (baseUrl, action, payload = {}) => {
    const token = await Auth.getIdToken();
    if (!token) {
      const err = new Error('signed out');
      err.status = 401;
      throw err;
    }

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, ...payload })
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const err = new Error((data && data.error) || `request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  };

  const read = (action, payload) => call(cfg.readUrl, action, payload);
  const save = (action, payload) => call(cfg.saveUrl, action, payload);
  const admin = (action, payload) => call(cfg.adminUrl, action, payload);

  // Direct browser -> S3 PUT. XHR rather than fetch because only XHR reports
  // upload progress, and this is the one slow step in the flow.
  const putToS3 = (url, file, onProgress) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', 'application/pdf');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`upload failed (${xhr.status})`));
      xhr.onerror = () => reject(new Error('upload failed — network or CORS error'));
      xhr.send(file);
    });

  const uploadDocument = async (policyId, file, onProgress) => {
    if (file.size > cfg.maxUploadBytes) throw new Error('File is larger than 10 MB');
    if (file.type !== 'application/pdf') throw new Error('Only PDF files are accepted');

    const { url, s3Key } = await save('getUploadUrl', {
      policyId,
      fileName: file.name,
      contentType: 'application/pdf'
    });

    await putToS3(url, file, onProgress);
    return save('confirmUpload', { policyId, s3Key });
  };

  return { read, save, admin, uploadDocument };
})();
