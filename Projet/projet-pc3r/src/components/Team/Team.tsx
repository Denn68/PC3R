import React from "react";
import Member from "./Member";
import TeamData from "../../Data/team.json";

// Typage de la structure des données du fichier JSON
interface TeamMember {
  name: string;
  image_src: string;
  role: string;
}

export const Team: React.FC = () => {
  return (
    <div className="team-container">
      <h1 className="team-title">Notre équipe</h1>
      <div className="team-members">
        {TeamData.team.map((member: TeamMember, index: number) => (
          <div key={index} className="team-member">
            <Member name={member.name} image={member.image_src} role={member.role} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
