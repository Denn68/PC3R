import React from "react";

interface MemberProps {
    name: string;
    image: string;
    role: string;
}

export const Member: React.FC<MemberProps> = ({ name, image, role }) => {
    return (
        <div className="member-card">
            <div className="member-image-container">
                <img className="member-image" src={image} alt={name} />
            </div>
            <div className="member-info">
                <h3 className="member-name">{name}</h3>
                <p className="member-role">{role}</p>
            </div>
        </div>
    );
};

export default Member;
