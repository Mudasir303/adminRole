const AppConfig = {
    API_BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '')
        ? 'http://localhost:5000'
        : 'https://adminrole-qg65.onrender.com'
};