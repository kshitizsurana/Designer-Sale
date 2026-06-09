/* global React, AIcon, API */
// Admin Bulk Upload — Handles CSV dropping, previews, and uploading

const { useState: useUpState, useRef } = React;

function AdminBulkUpload({ toast }) {
  const [file, setFile] = useUpState(null);
  const [dragOver, setDragOver] = useUpState(false);
  const [uploading, setUploading] = useUpState(false);
  const [result, setResult] = useUpState(null);
  const fileRef = useRef(null);

  function handleFile(f) {
    if (f.type !== 'text/csv' && !f.name.endsWith('.csv')) {
      toast('Please upload a valid CSV file', 'error');
      return;
    }
    setFile(f);
    setResult(null); // Reset result on new file
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  async function processUpload() {
    if (!file) return;
    setUploading(true);
    try {
        const res = await API.products.bulkUpload(file);
        setResult({
            imported: res.imported,
            errors: res.errors
        });
        toast(`Successfully imported ${res.imported} products`, 'success');
        setFile(null);
        if (fileRef.current) fileRef.current.value = '';
    } catch(e) {
        toast(`Upload failed: ${e.message}`, 'error');
    } finally {
        setUploading(false);
    }
  }

  function downloadTemplate() {
    const headers = 'title,brandId,merchantId,category,rrp,sale,sizes,image,description\n';
    const row = 'Bias-Cut Silk Slip,fashion-spectrum,blue-bungalow,maxi-dresses,350,245,"S, M, L",https://example.com/img.jpg,Stunning silk dress\n';
    const blob = new Blob([headers + row], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ds_product_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="admin-section-head">
        <div>
          <div className="admin-section-title">Bulk CSV Upload</div>
          <div className="admin-section-sub">Import hundreds of products at once</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={downloadTemplate}>
          Download template
        </button>
      </div>

      {!result && (
          <div 
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current && fileRef.current.click()}
          >
            <div className="upload-zone-icon">
              {file ? <AIcon.Check /> : <AIcon.Upload />}
            </div>
            {file ? (
              <>
                <h3 style={{ color: 'var(--success)' }}>{file.name} ready</h3>
                <p>Click below to begin importing products.</p>
              </>
            ) : (
              <>
                <h3>Drop your CSV file here</h3>
                <p>or click to browse from your computer</p>
              </>
            )}
            <input 
              type="file" 
              accept=".csv" 
              style={{ display: 'none' }} 
              ref={fileRef}
              onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
            />
          </div>
      )}

      {file && !result && (
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}>Cancel</button>
          <button className="btn btn-gold" onClick={processUpload} disabled={uploading}>
            {uploading ? 'Processing...' : 'Start Import'}
          </button>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 24, background: 'var(--success-bg)', border: '1px solid var(--success)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 999, background: 'var(--success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AIcon.Check />
                </div>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--success)' }}>Import Complete</div>
                    <div style={{ color: 'var(--success)', opacity: 0.8 }}>Successfully imported {result.imported} products into the database.</div>
                </div>
            </div>

            {result.errors && result.errors.length > 0 && (
                <div className="validation-panel">
                    <div className="validation-head">
                        <AIcon.Alert />
                        <strong>Ignored {result.errors.length} invalid rows</strong>
                    </div>
                    <div className="validation-body">
                        {result.errors.map((err, i) => (
                            <div key={i} className="validation-row">
                                <AIcon.Close />
                                <span><strong>Row {err.row}:</strong> {err.msg}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button className="btn btn-outline" style={{ marginTop: 24 }} onClick={() => setResult(null)}>
                Upload another file
            </button>
        </div>
      )}

      <div style={{ marginTop: 48, padding: 24, background: 'var(--bg-elevated)', border: '1px solid var(--line)' }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16 }}>Important Notes</h4>
        <ul style={{ color: 'var(--ink-soft)', fontSize: 13, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>The system will <strong>skip</strong> any invalid rows (e.g. missing fields, unknown Brand/Merchant ID) and continue importing the rest of the file.</li>
            <li><strong>brandId</strong> and <strong>merchantId</strong> must exactly match existing IDs in the system. Check the respective tabs for IDs (for this prototype, they are generated automatically).</li>
            <li>Sizes should be comma separated (e.g. <code>S, M, L</code>).</li>
            <li>Category must be one of the standard IDs: <code>maxi-dresses, kaftans, tops-blouses, coats-jackets, bags-accessories, jewellery</code></li>
        </ul>
      </div>

    </div>
  );
}

window.AdminBulkUpload = AdminBulkUpload;
