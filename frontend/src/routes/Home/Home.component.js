import { useState, useEffect } from "react"
import { FilePond } from 'react-filepond'
import { ModalInfo } from '../../components/Modal'
import { Bar } from '../../components/BarLoader'
import { FiUploadCloud, FiFileText, FiType } from 'react-icons/fi'
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
                title="Upload Successful!"
                content="Your sales data has been uploaded. Check the Insights page to view analytics."
                img="https://i.pinimg.com/564x/e2/55/a1/e255a1e433105bcbf891060bde64e958.jpg"/>
            
            {/* Animated background elements */}
            <div className="bg-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            <div className="upload-card glass">
                <div className="upload-header">
                    <div className="upload-icon">
                        <FiUploadCloud />
                    </div>
                    <h1>Upload Sales Data</h1>
                    <p>Import your data to generate powerful insights</p>
                </div>

                <form onSubmit={handleSubmit} className="upload-form">
                    <div className="input-group">
                        <FiType className="input-icon" />
                        <input  
                            type="text" 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="Enter title"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FiFileText className="input-icon" />
                        <input  
                            type="text" 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Enter description"
                        />
                    </div>

                    <div className="filepond-wrapper">
                        <FilePond
                            files={files}
                            onupdatefiles={fileItems => {setFiles(fileItems.map(fileItem => fileItem.file))}}
                            allowMultiple={true}
                            maxFiles={10}
                            name="files"
                            labelIdle='<span class="filepond-label">Drag & drop files here or <span class="filepond-browse">browse</span></span>'
                        />
                    </div>

                    <button type="submit" className="upload-button" disabled={props.home?.loading}>
                        {props.home?.loading ? (
                            <span className="loading-text">Uploading...</span>
                        ) : (
                            <>
                                <FiUploadCloud />
                                <span>Upload Files</span>
                            </>
                        )}
                    </button>
                    <Bar loading={props.home?.loading} />
                </form>
            </div>
        </div>   
    );
}

export default Home;