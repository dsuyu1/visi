import * as runtime from 'react/jsx-runtime'
import { useMemo } from 'react'
import Image from 'next/image'

const sharedComponents = {
  Image
}

// The MDX body arrives as compiled code, so the component has to be built at
// runtime. Memoizing on `code` keeps its identity stable between renders.
const useMDXComponent = (code) => {
  return useMemo(() => {
    const fn = new Function(code)
    return fn({ ...runtime }).default
  }, [code])
}

 const MDXContent = ({ code, components, ...props }) => {
  const Component = useMDXComponent(code)
  // The component is compiled from post content, so it cannot be declared
  // outside of render.
  // eslint-disable-next-line react-hooks/static-components
  return <Component components={{ ...sharedComponents, ...components }} {...props} />
}

export default MDXContent