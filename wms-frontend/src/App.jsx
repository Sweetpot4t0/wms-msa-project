import { useEffect, useState } from 'react'

function App() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]); // 히스토리 데이터 상태
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. 재고 목록 데이터 가져오기
  const fetchProducts = () => {
    fetch('http://localhost:8081/api/inventory')
      .then(res => res.json())
      .then(data => setProducts(data.sort((a, b) => a.id - b.id)))
      .catch(err => console.error("데이터 로딩 실패:", err));
  };

  // 2. 입/출고 히스토리 데이터 가져오기
  const fetchHistory = () => {
    fetch('http://localhost:8081/api/inventory/history')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error("히스토리 로딩 실패:", err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 검색 필터링
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 수량 수정
  const handleUpdateStock = (id, newStock) => {
    if (newStock < 0) return;
    fetch(`http://localhost:8081/api/inventory/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock })
    })
    .then(async (res) => {
      if (res.ok) {
        fetchProducts();
        fetchHistory(); // 수량 변경 후 히스토리 갱신
      } else {
        const errorMsg = await res.text();
        alert(errorMsg); //"다른 사용자가 이미 수정 중입니다." 를 출력
        fetchProducts(); //최신데이터를 호출하여 갱신
      }
    });
  };

  // 삭제 로직
  const handleDelete = (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      fetch(`http://localhost:8081/api/inventory/${id}`, {
        method: 'DELETE'
      })
      .then(res => {
        if (res.ok) fetchProducts();
        else alert("삭제에 실패했습니다.");
      });
    }
  };

  // 스타일 정의
  const containerStyle = { padding: '40px', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f0f2f5', minHeight: '100vh' };
  const cardStyle = { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', padding: '30px', maxWidth: '1000px', margin: '0 auto' };
  const menuCardStyle = {
    padding: '30px', backgroundColor: 'white', borderRadius: '15px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer',
    textAlign: 'center', transition: 'transform 0.2s', border: '1px solid #eee'
  };
  const btnStyle = { padding: '6px 12px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff' };

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 onClick={() => setCurrentView('dashboard')} style={{ cursor: 'pointer', color: '#1a73e8', display: 'inline-block' }}>
          📦 WMS MSA SYSTEM
        </h1>
      </div>

      {/* 대시보드 */}
      {currentView === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={menuCardStyle} onClick={() => setCurrentView('list')}>
            <h2 style={{ fontSize: '40px', margin: '0' }}>🔍</h2>
            <h3>재고 검색 및 조정</h3>
            <p style={{ color: '#666' }}>현재 재고 확인 및 수량 변경</p>
          </div>
          <div style={menuCardStyle} onClick={() => setCurrentView('register')}>
            <h2 style={{ fontSize: '40px', margin: '0' }}>➕</h2>
            <h3>신규 상품 등록</h3>
            <p style={{ color: '#666' }}>새 품목 입고 등록</p>
          </div>
          <div style={menuCardStyle} onClick={() => { fetchHistory(); setCurrentView('history'); }}>
            <h2 style={{ fontSize: '40px', margin: '0' }}>📜</h2>
            <h3>입/출고 히스토리</h3>
            <p style={{ color: '#666' }}>재고 변동 이력 확인</p>
          </div>
          <div style={{ ...menuCardStyle, opacity: 0.5, cursor: 'not-allowed' }}>
            <h2 style={{ fontSize: '40px', margin: '0' }}>📊</h2>
            <h3>재고 통계</h3>
            <p style={{ color: '#666' }}>(개발 예정)</p>
          </div>
        </div>
      )}

      {/* 재고 목록 */}
      {currentView === 'list' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={() => setCurrentView('dashboard')} style={{ ...btnStyle, backgroundColor: '#6c757d', color: 'white', border: 'none' }}>⬅ 뒤로가기</button>
            <input
              type="text"
              placeholder="상품명으로 실시간 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '12px', width: '400px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
            />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333', textAlign: 'left', backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '15px' }}>ID</th>
                <th style={{ padding: '15px' }}>상품명</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>수량 조절</th>
                <th style={{ padding: '15px' }}>상태</th>
                <th style={{ padding: '15px' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>{p.id}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{p.name}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <button onClick={() => handleUpdateStock(p.id, p.stock - 1)} style={btnStyle}>-</button>
                      <span style={{ minWidth: '60px', fontWeight: 'bold' }}>{p.stock?.toLocaleString()}개</span>
                      <button onClick={() => handleUpdateStock(p.id, p.stock + 1)} style={btnStyle}>+</button>
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: p.stock > 50 ? '#e3fcef' : '#ff4d4f',
                      color: p.stock > 50 ? '#00875a' : '#ffffff',
                      display: 'inline-block', textAlign: 'center', minWidth: '70px'
                    }}>
                      {p.stock > 50 ? '안정' : '재고부족'}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button onClick={() => handleDelete(p.id)} style={{ padding: '6px 12px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 신규 등록 */}
      {currentView === 'register' && (
        <div style={{ ...cardStyle, maxWidth: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>🆕 신규 상품 등록</h2>
            <button onClick={() => setCurrentView('dashboard')} style={{ ...btnStyle, backgroundColor: '#6c757d', color: 'white', border: 'none' }}>취소</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input id="name" placeholder="상품명 입력" style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} />
            <input id="count" type="number" placeholder="초기 수량 입력" style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} />
            <button onClick={() => {
              const nameInput = document.getElementById('name');
              const countInput = document.getElementById('count');
              if(!nameInput.value || !countInput.value) return alert("데이터를 입력하세요.");
              fetch('http://localhost:8081/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nameInput.value, stock: parseInt(countInput.value) })
              }).then(res => {
                if(res.ok) {
                  fetchProducts();
                  setCurrentView('list');
                }
              });
            }} style={{ padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              상품 등록 완료
            </button>
          </div>
        </div>
      )}

      {/* 입/출고 히스토리 목록 */}
      {currentView === 'history' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={() => setCurrentView('dashboard')} style={{ ...btnStyle, backgroundColor: '#6c757d', color: 'white', border: 'none' }}>⬅ 뒤로가기</button>
            <h2 style={{ margin: 0 }}>📜 입/출고 히스토리</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333', textAlign: 'left', backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '15px' }}>시간</th>
                <th style={{ padding: '15px' }}>상품명</th>
                <th style={{ padding: '15px' }}>변동</th>
                <th style={{ padding: '15px' }}>구분</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px', fontSize: '0.9rem', color: '#666' }}>{new Date(h.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{h.productName}</td>
                  <td style={{ padding: '15px', color: h.amount > 0 ? '#00875a' : '#ff4d4f', fontWeight: 'bold' }}>
                    {h.amount > 0 ? `+${h.amount}` : h.amount}개
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                      backgroundColor: h.type === '입고' ? '#e3fcef' : '#fff1f0',
                      color: h.type === '입고' ? '#00875a' : '#ff4d4f'
                    }}>
                      {h.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && <p style={{ textAlign: 'center', color: '#999', marginTop: '30px' }}>기록된 히스토리가 없습니다.</p>}
        </div>
      )}
    </div>
  )
}

export default App