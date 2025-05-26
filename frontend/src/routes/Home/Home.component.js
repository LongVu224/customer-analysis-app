import { useState, useEffect } from "react"
import { FilePond } from 'react-filepond'
import { ModalInfo } from '../../components/Modal'
import { Bar } from '../../components/BarLoader'
import './Home.scss';
import 'filepond/dist/filepond.min.css'

const Home = (props) => {
    const [title, setTitle] = useState(null)
    const [description, setDescription] = useState(null)
    const [files, setFiles] = useState([])
    const [showModal, setShowModal] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault();
        const fileData = new FormData()
        fileData.append("title", title)
        fileData.append("description", description)
        files.map(file => fileData.append("saleFile", file))
        props.onUploadFile(fileData)
    }

    useEffect(() => {
        if(props.home?.uploaded) {
            setShowModal(true)
        }
    },[props.home?.uploaded])

    return (
        <div className="upload-container">
        <ModalInfo 
            showModal={showModal} 
            setShowModal={() => setShowModal(!showModal)}
            title="Successfully uploaded sale data"
            content="Please check the insights page to see the uploaded data"
            img="https://i.pinimg.com/564x/e2/55/a1/e255a1e433105bcbf891060bde64e958.jpg"/>
        <div className="upload-form-box">
          <div className="upload-header-form">
            <h4 className="text-center"><i className="fas fa-cloud-upload-alt" style={{fontSize:"70px"}}></i></h4>
          </div>
          <div className="upload-body-form">
           <form onSubmit={handleSubmit}>
            <div className="input-group mb-3 upload-input">
                <input  type="text" 
                        className="form-control" 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Title" />
            </div>
            <div className="input-group mb-3 upload-input">
                <input  type="text" 
                        className="form-control" 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Text" />
            </div>
            <div className="">
                <FilePond
                    files={files}
                    onupdatefiles={fileItems => {setFiles(fileItems.map(fileItem => fileItem.file))}}
                    allowMultiple={true}
                    maxFiles={10}
                    name="files"
                    labelIdle='Drag & Drop files or <span class="filepond--label-action">Browse</span>'
                />
            </div>
                <button type="submit" className="btn btn-secondary btn-block upload-button" >Upload</button>
                <Bar loading={props.home?.loading} />
            </form>
          </div>
        </div>
       </div>   
    );
}

export default Home;