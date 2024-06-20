import React from 'react';

interface CardItemProps {
    bgClass: string;
    iconSrc: string;
    textClass: string;
    title: string;
    value: string | number;
}

const CardItem: React.FC<CardItemProps> = ({ bgClass, iconSrc, textClass, title, value }) => {
    return (
        <div className="mx-2">
            <div className={`card border-0 zoom-in ${bgClass} shadow-none`}>
                <div className="card-body">
                    <div className="text-center">
                        <img src={iconSrc} width="50" height="50" className="mb-3" alt="icon" />
                        <p className={`fw-semibold fs-3 ${textClass} mb-1`}>{title}</p>
                        <h5 className={`fw-semibold ${textClass} mb-0`}>{value}</h5>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardItem;
