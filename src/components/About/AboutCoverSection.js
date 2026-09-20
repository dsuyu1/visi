import Image from 'next/image'
import React from 'react'
import logo from "../../../public/logo.png"

const AboutCoverSection = () => {
  return (
    <section className='w-full md:h-[75vh] border-b-2 border-solid border-dark dark:border-light flex flex-col md:flex-row items-center justify-center text-dark dark:text-light'>
        <div className='w-full md:w-1/2 h-full border-r-2 border-solid border-dark dark:border-light flex justify-center items-center p-8'>
            <Image src={logo} alt="Vaquero Information Security Initiative"
            className='w-3/5 xs:w-1/2 md:w-4/5 h-full object-contain object-center'
            priority
            sizes="(max-width: 768px) 100vw,(max-width: 1180px) 50vw, 50vw"
            />
        </div>

        <div className='w-full md:w-1/2 flex flex-col text-left items-start justify-center px-5 xs:p-10 pb-10 lg:px-16'>
            <h2 className='font-bold capitalize text-4xl xs:text-5xl sxl:text-6xl  text-center lg:text-left'>
            Learn security by doing it
            </h2>
            <p className='font-medium mt-4 text-base'>
            The Vaquero Information Security Initiative is a student organization at the University of Texas Rio Grande Valley. We run hands-on workshops, compete in capture-the-flag events, study for certifications together, and help members turn all of it into internships and first jobs. Every session starts from the assumption that you have not done this before, because most of us had not either.
            </p>
            <p className='font-medium mt-4 text-base'>
            We meet on campus in Edinburg and work with the wider security community across the Rio Grande Valley. Bring a laptop and some curiosity — that is the whole list of requirements.
            </p>
        </div>
    </section>
  )
}

export default AboutCoverSection
