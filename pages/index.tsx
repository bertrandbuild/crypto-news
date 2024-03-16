import * as React from 'react'
import type { NextPage } from 'next'
import Image from 'next/image'
import { Box, ButtonGroup, Container, FormControl, FormHelperText, FormLabel, HStack, Icon, Input, Stack } from '@chakra-ui/react'
import { Br } from '@saas-ui/react'
import { ButtonLink } from 'components/button-link'
import { BackgroundGradient } from 'components/gradients/background-gradient'
import { Hero } from 'components/hero'
import { NextjsLogo, ChakraLogo } from 'components/logos'
import { FallInPlace } from 'components/motion/fall-in-place'
import { Em } from 'components/typography'
import { FiArrowRight } from 'react-icons/fi'

const Home: NextPage = () => {
  return (
    <Box className="flex flex-col min-h-screen">
      <HeroSection />
    </Box>
  )
}

function extractVideoId(input) {
  // Check if input is directly a video ID (assuming video IDs are 11 characters long and do not contain special URL characters)
  if (input.length === 11 && !input.includes('/') && !input.includes('?') && !input.includes('&')) {
      return input;
  }

  // Attempt to handle the input as a URL
  try {
      const url = new URL(input.startsWith('http://') || input.startsWith('https://') ? input : `https://${input}`);
      const urlParams = new URLSearchParams(url.search);
      const videoId = urlParams.get('v');

      if (videoId) {
          return videoId;
      }

      // In some cases, the video ID might be part of the pathname for certain URL formats, e.g., "https://youtu.be/Dwb4u8my4vg"
      const pathSegments = url.pathname.split('/').filter(Boolean); // Remove any empty strings due to leading or trailing slashes
      if (pathSegments.length && pathSegments[0].length === 11) {
          return pathSegments[0];
      }
  } catch (error) {
      console.error("Error parsing input:", error);
  }

  return null; // Return null if the video ID couldn't be determined
}

function getTranscript(videoId) {
  const endpoint = `http://localhost:3000/api/get_transcript?videoId=${videoId}`;
  fetch(endpoint)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('There was a problem with your fetch operation:', error);
    });
}


const handleSubmit = (videoUrl) => {
  const videoId = extractVideoId(videoUrl);
  if (videoId) {
    try {
      const transcript = getTranscript(videoId)
      console.log(transcript);
      // const transcriptCid = saveOnChain(transcript)
      // const aiInsights = getAiInsights(transcript)
      // const insightCid = saveOnChain(aiInsights)
      // const tx = saveToContract(videoId, transcriptCid, insightCid)
      // console.log(tx);
    } catch (error) {
      console.error(error);
    }
  }
}

const HeroSection: React.FC = () => {
  return (
    <Box position="relative" overflow="hidden">
      <BackgroundGradient height="100%" />
      <Container maxW="container.xl" pt={{ base: 40, lg: 60 }} pb="40">
        <Stack direction={{ base: 'column', lg: 'row' }} alignItems="center">
          <Hero
            id="home"
            justifyContent="flex-start"
            px="0"
            title={
              <FallInPlace>
                Build beautiful
                <Br /> software faster
              </FallInPlace>
            }
            description={
              <FallInPlace delay={0.4} fontWeight="medium">
                Saas UI is a <Em>React component library</Em>
                <Br /> that doesn&apos;t get in your way and helps you <Br />{' '}
                build intuitive SaaS products with speed.
              </FallInPlace>
            }
          >
            <FallInPlace delay={0.8}>
              <HStack pt="4" pb="12" spacing="8">
                <NextjsLogo height="28px" /> <ChakraLogo height="20px" />
              </HStack>

              <ButtonGroup spacing={4} alignItems="center">
                <ButtonLink colorScheme="primary" size="lg" href="/signup">
                  Sign Up
                </ButtonLink>
                <ButtonLink
                  size="lg"
                  href="https://demo.saas-ui.dev"
                  variant="outline"
                  rightIcon={
                    <Icon
                      as={FiArrowRight}
                      sx={{
                        transitionProperty: 'common',
                        transitionDuration: 'normal',
                        '.chakra-button:hover &': {
                          transform: 'translate(5px)',
                        },
                      }}
                    />
                  }
                >
                  View demo
                </ButtonLink>
              </ButtonGroup>
              <form onSubmit={(event) => {
                    event.preventDefault(); // Prevent the default form submission behavior
                    const formData = new FormData(event.currentTarget);
                    const url = formData.get('videoUrl'); // Assuming 'videoUrl' is the name of your input field
                    handleSubmit(url);
                }}>
                <FormControl>
                  <FormLabel>Enter the youtube video url of your favorite crypto degen</FormLabel>
                  <Input type='text' name='videoUrl' placeholder='url like : "https://youtube.com/watch?v=Dwb4u8my4vg" or just "Dwb4u8my4vg"'/>
                  <FormHelperText>We will build insight on the video</FormHelperText>
                </FormControl>
              </form>
            </FallInPlace>
          </Hero>
          <Box
            height="600px"
            position="absolute"
            display={{ base: 'none', lg: 'block' }}
            left={{ lg: '60%', xl: '55%' }}
            width="80vw"
            maxW="1100px"
            margin="0 auto"
          >
            <FallInPlace delay={1}>
              <Box overflow="hidden" height="100%">
                <Image
                  src="/static/screenshots/list.png"
                  layout="fixed"
                  width={1200}
                  height={762}
                  alt="Screenshot of a ListPage in Saas UI Pro"
                  quality="75"
                  priority
                />
              </Box>
            </FallInPlace>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

export default Home
