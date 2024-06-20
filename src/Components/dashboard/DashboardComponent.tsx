import React from 'react';
import iconConnect from "@/assets/images/svgs/icon-connect.svg";
import iconSpeechBubble from "@/assets/images/svgs/icon-speech-bubble.svg";
import iconFavorites from "@/assets/images/svgs/icon-favorites.svg";
import iconMailBox from "@/assets/images/svgs/icon-mailbox.svg";
import iconBriefCase from "@/assets/images/svgs/icon-briefcase.svg";
import iconUserMale from "@/assets/images/svgs/icon-user-male.svg";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CardItem from "Components/utils/CardItem.tsx";

interface ICardData {
    bgClass: string;
    iconSrc: string;
    textClass: string;
    title: string;
    value: string | number;
}

const DashboardComponent: React.FC = () => {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        slideMargin: 20,
        autoScroll: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    initialSlide: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    const cardsData: ICardData[] = [
        { bgClass: "bg-primary-subtle", iconSrc: iconUserMale, textClass: "text-primary", title: "Employees", value: "96" },
        { bgClass: "bg-success-subtle", iconSrc: iconSpeechBubble, textClass: "text-success", title: "Payroll", value: "$96k" },
        { bgClass: "bg-danger-subtle", iconSrc: iconFavorites, textClass: "text-danger", title: "Events", value: "696" },
        { bgClass: "bg-info-subtle", iconSrc: iconMailBox, textClass: "text-info", title: "Projects", value: "356" },
        { bgClass: "bg-warning-subtle", iconSrc: iconBriefCase, textClass: "text-warning", title: "Clients", value: "3,650" },
        { bgClass: "bg-info-subtle", iconSrc: iconConnect, textClass: "text-info", title: "Reports", value: "59" },
    ];

    return (
        <div className='slider-container'>
            <Slider {...settings}>
                {cardsData.map((card, index) => (
                    <CardItem
                        key={index}
                        bgClass={card.bgClass}
                        iconSrc={card.iconSrc}
                        textClass={card.textClass}
                        title={card.title}
                        value={card.value}
                    />
                ))}
            </Slider>
        </div>
    );
};

export default DashboardComponent;
