import React from "react";
import { useParams } from 'react-router-dom';

class ClassRoster extends React.Component {
    render() {
        return (
            <div>
                Class ID: {this.props.classId}
                {/* Render your component content here */}
            </div>
        );
    }
}

const ClassRosterWrapper = () => {
    const { classId } = useParams();

    return <ClassRoster classId={classId} />;
};

export default ClassRosterWrapper;
