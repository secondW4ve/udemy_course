const initialState = {
    id: 0,
    username: '',
    displayName: '',
    image: '',
    password: '',
    isLoggedIn: false,
};

export default function authReducer(state = initialState, action){
    switch (action.type){
        case 'login-success':
            return {
                ...action.payload,
                isLoggedIn: true,
            }
        case 'logout-success':
            return {...initialState};
        case 'update-success':
            return {
                ...state,
                displayName: action.payload.displayName,
                image: action.payload.image
            }    
        default:
            return state;
    }
}