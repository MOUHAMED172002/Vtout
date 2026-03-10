import React from 'react'
import { Link } from 'react-router-dom'

const Button = ({text,bgColor,textColor,link,handler = () => {}}) => {
  return (
    <Link to={link} className={`${bgColor} ${textColor} cursor-pointer xs-mb-4 sm:mb-4 hover:scale-105 duration-300 py-2 px-8 rounded-full relative z-10`} onClick={handler}>
      {text}
    </Link>
  )
}

export default Button
