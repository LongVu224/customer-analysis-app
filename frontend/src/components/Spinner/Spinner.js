import './Spinner.css';

export const Spinner = () => (
    <div className="spinner-container">
        <div className="spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
        </div>
        <p className="spinner-text">Loading...</p>
    </div>
);
