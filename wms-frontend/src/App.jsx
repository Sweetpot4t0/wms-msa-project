import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- 로그인 관련 상태 ---
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [loginInfo, setLoginInfo] = useState({ username: '', password: '' });

  // 공통 헤더 (토큰 포함)
  const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  // [추가] 엑셀 다운로드 로직
  const handleExcelDownload = () => {
    fetch('http://localhost:8081/api/inventory/excel', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => {
      if (res.status === 403) {
        handleLogout();
        throw new Error('Unauthorized');
      }
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_report_${new Date().toLocaleDateString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => console.error("엑셀 다운로드 실패:", err));
  };

  const fetchProducts = (page = 0, name = searchTerm) => {
    if (!isLoggedIn) return;
    fetch(`http://localhost:8081/api/inventory?name=${name}&page=${page}&size=10`, {
      headers: getAuthHeader()
    })
      .then(res => {
        if (res.status === 403) {
          handleLogout();
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(data.number || 0);
      })
      .catch(err => console.error("데이터 로딩 실패:", err));
  };

  const fetchStats = () => {
    fetch('http://localhost:8081/api/inventory/stats', { headers: getAuthHeader() })
      .then(res => res.json())
      .then(data => {
        const chartData = [
          { name: '안정', value: Number(data.안정) || 0, color: '#00875a' },
          { name: '재고부족', value: Number(data.재고부족) || 0, color: '#ff9900' },
          { name: '품절', value: Number(data.품절) || 0, color: '#ff4d4f' }
        ];
        setStats(chartData);
      })
      .catch(err => console.error("통계 로딩 실패:", err));
  };

  const fetchHistory = () => {
    fetch('http://localhost:8081/api/inventory/history', { headers: getAuthHeader() })
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error("히스토리 로딩 실패:", err));
  };

  const handleLogin = () => {
    fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginInfo)
    })
    .then(res => {
      if (res.ok) return res.json();
      throw new Error('로그인 실패');
    })
    .then(data => {
      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      setCurrentView('dashboard');
    })
    .catch(err => alert("아이디 또는 비밀번호를 확인하세요."));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      const delayDebounceFn = setTimeout(() => {
        fetchProducts(0, searchTerm);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, isLoggedIn]);

  const getHighlightedText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <strong key={i} style={{ color: '#1a73e8', fontWeight: 'bold', borderBottom: '1px solid #1a73e8' }}>
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const handleUpdateStock = (id, newStock) => {
    if (newStock < 0) {
      alert("재고는 0개 미만으로 내릴 수 없습니다.");
      return;
    }

    fetch(`http://localhost:8081/api/inventory/${id}/stock`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ stock: newStock })
    })
    .then(async (res) => {
      if (res.ok) {
        fetchProducts(currentPage);
        fetchHistory();
      } else if (res.status === 403) {
        handleLogout();
      } else {
        const errorMsg = await res.text();
        alert(errorMsg || "수정 중 오류가 발생했습니다.");
        fetchProducts(currentPage);
      }
    })
    .catch(err => console.error("네트워크 에러:", err));
  };

  const handleDelete = (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      fetch(`http://localhost:8081/api/inventory/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      .then(res => {
        if (res.ok) fetchProducts(currentPage);
        else if (res.status === 403) handleLogout();
        else alert("삭제에 실패했습니다.");
      });
    }
  };

  const containerStyle = { padding: '40px', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f0f2f5', minHeight: '100vh' };
  const cardStyle = { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', padding: '30px', maxWidth: '1000px', margin: '0 auto' };
  const loginCardStyle = { ...cardStyle, maxWidth: '400px', marginTop: '100px', textAlign: 'center' };
  const menuCardStyle = {
    padding: '30px', backgroundColor: 'white', borderRadius: '15px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer',
    textAlign: 'center', transition: 'transform 0.2s', border: '1px solid #eee'
  };
  const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', marginBottom: '10px', width: '100%', boxSizing: 'border-box' };
  const btnStyle = { padding: '6px 12px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff' };

  if (!isLoggedIn) {
    return (
      <div style={containerStyle}>
        <div style={loginCardStyle}>
          <h1 style={{ color: '#1a73e8' }}>📦 WMS LOGIN</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>관리자 계정으로 로그인하세요.</p>
          <input
            type="text"
            placeholder="아이디 (admin)"
            style={inputStyle}
            onChange={(e) => setLoginInfo({...loginInfo, username: e.target.value})}
            onKeyDown={handleKeyDown}
          />
          <input
            type="password"
            placeholder="비밀번호 (1234)"
            style={inputStyle}
            onChange={(e) => setLoginInfo({...loginInfo, password: e.target.value})}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleLogin} style={{ ...btnStyle, backgroundColor: '#1a73e8', color: 'white', width: '100%', marginTop: '10px', fontSize: '18px', border: 'none', padding: '12px' }}>
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: '40px' }}>
        <h1 onClick={() => setCurrentView('dashboard')} style={{ cursor: 'pointer', color: '#1a73e8', margin: 0 }}>
          📦 WMS MSA SYSTEM
        </h1>
        <button onClick={handleLogout} style={{ position: 'absolute', right: '5%', backgroundColor: '#f8f9fa', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
          로그아웃
        </button>
      </div>

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
          <div style={menuCardStyle} onClick={() => { fetchStats(); setCurrentView('stats'); }}>
            <h2 style={{ fontSize: '40px', margin: '0' }}>📊</h2>
            <h3>재고 통계</h3>
            <p style={{ color: '#666' }}>그래프로 보는 재고 현황</p>
          </div>
        </div>
      )}

      {currentView === 'list' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={() => setCurrentView('dashboard')} style={{ ...btnStyle, backgroundColor: '#6c757d', color: 'white', border: 'none' }}>⬅ 뒤로가기</button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="상품명으로 실시간 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '12px', width: '300px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
              />
              <button
                onClick={handleExcelDownload}
                style={{ ...btnStyle, backgroundColor: '#28a745', color: 'white', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
              >
                📥 엑셀 다운로드
              </button>
            </div>
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
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>{p.id}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{getHighlightedText(p.name, searchTerm)}</td>
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
                      backgroundColor: p.stock > 50 ? '#e3fcef' : '#fff1f0',
                      color: p.stock > 50 ? '#00875a' : '#ff4d4f',
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

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <button disabled={currentPage === 0} onClick={() => fetchProducts(currentPage - 1)} style={{ ...btnStyle, opacity: currentPage === 0 ? 0.5 : 1 }}>◀ 이전</button>
            <div style={{ fontWeight: 'bold', color: '#1a73e8' }}>{currentPage + 1} / {totalPages} 페이지</div>
            <button disabled={currentPage >= totalPages - 1} onClick={() => fetchProducts(currentPage + 1)} style={{ ...btnStyle, opacity: currentPage >= totalPages - 1 ? 0.5 : 1 }}>다음 ▶</button>
          </div>
        </div>
      )}

      {currentView === 'stats' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <button onClick={() => setCurrentView('dashboard')} style={{ ...btnStyle, backgroundColor: '#6c757d', color: 'white', border: 'none' }}>⬅ 뒤로가기</button>
            <h2 style={{ margin: 0 }}>📊 전체 재고 현황</h2>
          </div>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                  {stats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {stats.map(s => (
              <div key={s.name} style={{ textAlign: 'center', padding: '15px', border: `2px solid ${s.color}`, borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>{s.name}</h4>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{s.value}건</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === 'register' && (
        <div style={{ ...cardStyle, maxWidth: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>🆕 신규 상품 등록</h2>
            <button onClick={() => setCurrentView('dashboard')} style={{ ...btnStyle, backgroundColor: '#6c757d', color: 'white', border: 'none' }}>취소</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input id="regName" placeholder="상품명 입력" style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} />
            <input id="regCount" type="number" placeholder="초기 수량 입력" style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} />
            <button onClick={() => {
              const nameInput = document.getElementById('regName');
              const countInput = document.getElementById('regCount');
              if(!nameInput.value || !countInput.value) return alert("데이터를 입력하세요.");
              fetch('http://localhost:8081/api/inventory', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ name: nameInput.value, stock: parseInt(countInput.value) })
              }).then(res => {
                if(res.ok) { fetchProducts(0); setCurrentView('list'); }
                else if(res.status === 403) handleLogout();
                else alert("등록 실패");
              });
            }} style={{ padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              상품 등록 완료
            </button>
          </div>
        </div>
      )}

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
                    }}>{h.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default App