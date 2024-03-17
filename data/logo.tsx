import { chakra, HTMLChakraProps, useColorModeValue } from '@chakra-ui/react'

export const Logo: React.FC<HTMLChakraProps<'svg'>> = (props) => {
  const color = useColorModeValue('#231f20', '#fff')
  return (
    <span style={{ fontFamily: 'LondrinaSolid', fontWeight: 900, fontSize: 'xx-large' }}>NOUNWATCH</span>
  )
}
