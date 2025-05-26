const initialState = {
    data: [],
    loading: false,
    uploaded: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'UPLOAD_FILE_START':
            return {
                loading: true,
                uploaded: false
            }
        case 'UPLOAD_FILE_SUCCESS':
            return {
                data: action.file,
                loading: false,
                uploaded: true
            }
        case 'UPLOAD_FILE_FAIL':
            return {
                loading: false,
                uploaded: false
            }
        default: 
            return state;
    }
};

export default reducer;