import React from "react";
import { useParams } from "react-router";
const CoursesDetail = () => {
const { id } = useParams();  return (
    <div>
     
      <div>
        <h1>{id} Courses Detail Page</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus
          praesentium perferendis inventore libero id nemo incidunt fuga,
          tempora obcaecati molestiae aliquid voluptatem earum, rem enim? Nemo a
          vitae harum porro!
        </p>
      </div>
    </div>
  );
};

export default CoursesDetail;
