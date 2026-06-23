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

  // 💡 서버 IP 주소를 여기에 설정하세요!
  const API_BASE_URL = '';

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [loginInfo, setLoginInfo] = useState({ username: '', password: '' });
  const [notifications, setNotifications] = useState([]);

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    if (!isLoggedIn) return;

    const eventSource = new EventSource(`${API_BASE_URL}/api/inventory/notifications`);

    eventSource.addEventListener('connect', (e) => console.log("SSE 연결 완료"));
    eventSource.addEventListener('stock-warning', (e) => {
      setNotifications((prev) => [...prev, { id: Date.now() + Math.random(), message: e.data }]);
    });

    eventSource.onerror = () => eventSource.close();
    return () => eventSource.close();
  }, [isLoggedIn]);

  const handleExcelDownload = () => {
    fetch(`${API_BASE_URL}/api/inventory/excel`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => { if (res.status === 403) handleLogout(); return res.blob(); })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `inventory.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
    });
  };

  const handleDailyReportExcelDownload = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    fetch(`${API_BASE_URL}/api/inventory/report/excel?date=${todayStr}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `daily_report_${todayStr}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
    });
  };

  const fetchProducts = (page = 0, name = searchTerm) => {
    if (!isLoggedIn) return;
    fetch(`${API_BASE_URL}/api/inventory?name=${name}&page=${page}&size=10`, { headers: getAuthHeader() })
      .then(res => res.json())
      .then(data => {
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(data.number || 0);
      });
  };

  const fetchStats = () => {
    fetch(`${API_BASE_URL}/api/inventory/stats`, { headers: getAuthHeader() })
      .then(res => res.json())
      .then(data => {
        setStats([
          { name: '안정', value: Number(data.안정) || 0, color: '#00875a' },
          { name: '재고부족', value: Number(data.재고부족) || 0, color: '#ff9900' },
          { name: '품절', value: Number(data.품절) || 0, color: '#ff4d4f' }
        ]);
      });
  };

  const fetchHistory = () => {
    fetch(`${API_BASE_URL}/api/inventory/history`, { headers: getAuthHeader() })
      .then(res => res.json())
      .then(data => setHistory(data));
  };

  const handleLogin = () => {
    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginInfo)
    })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      window.location.reload();
    })
    .catch(() => alert("아이디 또는 비밀번호 확인 필요"));
  };

  const handleLogout = () => { localStorage.removeItem('token'); window.location.reload(); };

  useEffect(() => {
    if (isLoggedIn) {
      const timer = setTimeout(() => fetchProducts(0, searchTerm), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, isLoggedIn]);

  const handleUpdateStock = (id, newStock) => {
    fetch(`${API_BASE_URL}/api/inventory/${id}/stock`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ stock: newStock })
    }).then(() => { fetchProducts(currentPage); fetchHistory(); });
  };

  const handleDelete = (id) => {
    fetch(`${API_BASE_URL}/api/inventory/${id}`, { method: 'DELETE', headers: getAuthHeader() })
      .then(() => fetchProducts(currentPage));
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>📦 WMS LOGIN</h1>
        <input style={{ display: 'block', margin: '10px auto' }} placeholder="ID" onChange={(e) => setLoginInfo({...loginInfo, username: e.target.value})} />
        <input style={{ display: 'block', margin: '10px auto' }} type="password" placeholder="PW" onChange={(e) => setLoginInfo({...loginInfo, password: e.target.value})} />
        <button onClick={handleLogin}>로그인</button>
      </div>
    );
  }

  return (
    <div>
        {/* 기존 UI는 그대로 유지하되 위에서 정의한 API_BASE_URL을 사용하세요 */}
        {/* 나머지 렌더링 코드는 이전과 동일하게 유지하시면 됩니다. */}
        {/* (지면 관계상 생략했지만 위 로직을 반영하여 수정하시면 됩니다.) */}
    </div>
  )
}

export default App