import React from 'react';
import logo from "@/assets/images/logos/favicon.png";

const Preloader: React.FC = () => {
    return (
        <div className="preloader" style={{
            width: '100%',
            height: '100%',
            top: 0,
            position: 'fixed',
            zIndex: 999,
            background: '#fff'
        }}>
            <img src={logo} alt="loader" className="lds-ripple img-fluid" />
        </div>
    );
}

export default Preloader;
