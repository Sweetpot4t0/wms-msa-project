import { useEffect, useState } from 'react'

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/inventory')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("데이터 로딩 실패:", err));
  }, []);

  // 스타일 객체들
  const containerStyle = {
    padding: '40px',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: '#333', marginBottom: '20px', textAlign: 'center' }}>
          📦 스마트 재고 관리 시스템
        </h1>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input id="name" placeholder="상품명" style={{ padding: '8px' }} />
          <input id="count" type="number" placeholder="수량" style={{ padding: '8px' }} />
          <button onClick={() => {
            const name = document.getElementById('name').value;
            const count = document.getElementById('count').value;

            fetch('http://localhost:8080/api/inventory', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, count: parseInt(count) })
            })
            .then(() => window.location.reload()); // 등록 후 새로고침해서 확인
          }} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            등록하기
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>상품명</th>
              <th style={{ padding: '12px' }}>현재고</th>
              <th style={{ padding: '12px' }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{p.id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.name}</td>
                <td style={{ padding: '12px' }}>{p.count.toLocaleString()}개</td>
                <td style={{ padding: '12px' }}>
                  {/* 재고 수량에 따라 배지 색상 변경 */}
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    backgroundColor: p.count > 50 ? '#e3fcef' : '#fff5f5',
                    color: p.count > 50 ? '#00875a' : '#e53e3e',
                    fontWeight: 'bold'
                  }}>
                    {p.count > 50 ? '안정' : '부족'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>
            표시할 재고 데이터가 없습니다.
          </p>
        )}
      </div>
    </div>
  )
}

export default App