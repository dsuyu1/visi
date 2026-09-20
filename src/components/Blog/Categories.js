import { slug } from "github-slugger";
import React from "react";
import Category from "./Category";

const Categories = ({ categories, currentSlug }) => {
  return (
    <div className=" px-4 md:px-10 sxl:px-20 mt-10 text-dark dark:text-light bg-surface dark:bg-surfaceDark rounded-2xl py-4 flex items-start flex-wrap font-medium mx-5 md:mx-10">
      {categories.map((cat) => (
        <Category
          key={cat}
          link={`/categories/${cat}`}
          name={cat}
          active={currentSlug === slug(cat)}
        />
      ))}
    </div>
  );
};

export default Categories;
