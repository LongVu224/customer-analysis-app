import { uploadServiceInstance } from '../../../components/axios/axios';


export const uploadFileSuccess = (data) => {
    return {
        type: 'UPLOAD_FILE_SUCCESS',
        file: data
    };
};

export const uploadFileFail = (error) => {
    return {
        type: 'UPLOAD_FILE_FAIL',
        error: error
    };
};

export const uploadFileStart = () => {
    return {
        type: 'UPLOAD_FILE_START'
    }
};

export const uploadFile = (saleData, files) => {
    return dispatch => {
        dispatch(uploadFileStart());
        uploadServiceInstance.post('upload', saleData)
            .then(res => {
            console.log("res: ", res)
            if (res.status === 201) {
                dispatch(uploadFileSuccess(saleData));
            } else {
                dispatch(uploadFileFail(new Error('Unexpected response status')));
            }
            })
            .catch(err => {
            dispatch(uploadFileFail(err));
            });
    }
};