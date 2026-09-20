"use client";
import React from "react";
import { useForm } from "react-hook-form";

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  // TODO: this form is not wired to an inbox yet — submissions only log.
  const onSubmit = (data) => console.log(data);
  console.log(errors);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-12 text-base xs:text-lg sm:text-xl font-medium leading-relaxed font-in"
    >
      Hi VISI! My name is{" "}
      <input
        type="text"
        placeholder="your name"
        {...register("name", { required: true, maxLength: 80 })}
        className="outline-none border-0 p-0 mx-2 focus:ring-0 placeholder:text-center placeholder:text-lg border-b border-gray 
        focus:border-gray bg-transparent"
      />
      and I&apos;m reaching out about joining, speaking, or working together. You can
      email me at
      <input type="email" placeholder="your@email" {...register("email", {})}  className="outline-none border-0 p-0 mx-2 focus:ring-0 placeholder:text-center placeholder:text-lg border-b border-gray 
        focus:border-gray bg-transparent"/>
      or text me at
      <input
        type="tel"
        placeholder="your phone"
        {...register("phone number", {})}
        className="outline-none border-0 p-0 mx-2 focus:ring-0 placeholder:text-center placeholder:text-lg border-b border-gray 
        focus:border-gray bg-transparent"
      />
      Here is what I wanted to say: <br />
      <textarea {...register("message", {})} 
      placeholder="I'm a first-year student and..."
      rows={3}
      className="w-full outline-none border-0 p-0 mx-0 focus:ring-0  placeholder:text-lg border-b border-gray 
        focus:border-gray bg-transparent" />
      <input type="submit" value="send message" className="liquid-glass mt-8 font-medium inline-block capitalize text-lg sm:text-xl py-2 sm:py-3 px-7 sm:px-9 text-dark dark:text-light cursor-pointer" />
    </form>
  );
}
