import axios from 'axios';

export const signup = (user) => {
    return axios.post('/api/1.0/users', user);
};

export const login = (user) => {
    return axios.post('/api/1.0/login', {}, { auth: user });
};

export const setAuthorizationHeader = ({username, password, isLoggedIn}) => {
    if (isLoggedIn){
        axios.defaults.headers.common['Authorization'] = `Basic ${btoa(username + ':' + password)}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

export const listUsers = (callParameters = {page: 0, size: 3}) => {
    const path = `/api/1.0/users?page=${callParameters.page || 0}&size=${callParameters.size || 3}`;
    return axios.get(path);
};

export const getUser = (username) => {
    return axios.get(`/api/1.0/users/${username}`);
};

export const updateUser = (userId, body) => {
    return axios.put('/api/1.0/users/' + userId, body);
};

export const postWave = (wave) => {
    return axios.post('/api/1.0/waves', wave);
};

export const loadWaves = (username) => {
    const basePath = username 
    ? `/api/1.0/users/${username}/waves`
    : '/api/1.0/waves';
    return axios.get(basePath + '?page=0&size=5&sort=id,desc');
}

export const loadOldWaves = (waveId, username) => {
    const basePath = username 
    ? `/api/1.0/users/${username}/waves`
    : '/api/1.0/waves';
    const path = `${basePath}/${waveId}?direction=before&page=0&size=5&sort=id,desc`;
    return axios.get(path);
}

export const loadNewWaves = (waveId, username) => {
    const basePath = username 
    ? `/api/1.0/users/${username}/waves`
    : '/api/1.0/waves';
    const path = `${basePath}/${waveId}?direction=after&sort=id,desc`;
    return axios.get(path);
}

export const loadNewWaveCount = (waveId, username) => {
    const basePath = username 
    ? `/api/1.0/users/${username}/waves`
    : '/api/1.0/waves';
    const path = `${basePath}/${waveId}?direction=after&count=true`;
    return axios.get(path);
}

export const postWaveFile = (file) => {
    return axios.post('/api/1.0/waves/upload', file);
};

export const deleteWave = (waveId) => {
    return axios.delete(`/api/1.0/waves/${waveId}`);
}