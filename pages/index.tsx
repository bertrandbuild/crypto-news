import * as React from "react";
import type { NextPage } from "next";
import Image from "next/image";

import {
  Box,
  ButtonGroup,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  Input,
  Stack,
} from "@chakra-ui/react";
import { Br } from "@saas-ui/react";
import { ButtonLink } from "components/button-link";
import { BackgroundGradient } from "components/gradients/background-gradient";
import { Hero } from "components/hero";
import { NextjsLogo, ChakraLogo } from "components/logos";
import { FallInPlace } from "components/motion/fall-in-place";
import { Em } from "components/typography";
import { FiArrowRight } from "react-icons/fi";

const Home: NextPage = () => {
  return (
    <Box className="flex flex-col min-h-screen">
      <HeroSection />
    </Box>
  );
};

function extractVideoId(input) {
  // Check if input is directly a video ID (assuming video IDs are 11 characters long and do not contain special URL characters)
  if (
    input.length === 11 &&
    !input.includes("/") &&
    !input.includes("?") &&
    !input.includes("&")
  ) {
    return input;
  }

  // Attempt to handle the input as a URL
  try {
    const url = new URL(
      input.startsWith("http://") || input.startsWith("https://")
        ? input
        : `https://${input}`
    );
    const urlParams = new URLSearchParams(url.search);
    const videoId = urlParams.get("v");

    if (videoId) {
      return videoId;
    }

    // In some cases, the video ID might be part of the pathname for certain URL formats, e.g., "https://youtu.be/Dwb4u8my4vg"
    const pathSegments = url.pathname.split("/").filter(Boolean); // Remove any empty strings due to leading or trailing slashes
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
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("There was a problem with your fetch operation:", error);
    });
}

const handleSubmit = (videoUrl) => {
  const videoId = extractVideoId(videoUrl);
  if (videoId) {
    try {
      const transcript = getTranscript(videoId);
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
};

const HeroSection: React.FC = () => {
  return (
    <Box
      position="relative"
      overflow="hidden"
      backgroundImage={`url("static/images/SKY BG 2.png")`}
      backgroundSize="cover"
    >
      <Container maxW="container.xl" pt={{ base: 40, lg: 10 }} pb="40">
        <Stack direction={{ base: "column", lg: "column" }} alignItems="center">
          <Hero
            id="home"
            justifyContent="center"
            alignItems="center"
            px="0"
            title={<FallInPlace>Noun Watch, Look for insights</FallInPlace>}
            description={
              <FallInPlace delay={0.4} fontWeight="medium">
                Turn you fav crypto influencers videos into on-chain provable
                insights
              </FallInPlace>
            }
          >
            <FallInPlace delay={0.8}>
              <form
                onSubmit={(event) => {
                  event.preventDefault(); // Prevent the default form submission behavior
                  const formData = new FormData(event.currentTarget);
                  const url = formData.get("videoUrl"); // Assuming 'videoUrl' is the name of your input field
                  handleSubmit(url);
                }}
              >
                <FormControl mt="10">
                  <Input
                    border="solid 3px #000"
                    backgroundColor="rgba(255, 255, 255, 0.8)"
                    height="70"
                    type="text"
                    name="videoUrl"
                    placeholder='Paste url like : "https://youtube.com/watch?v=Dwb4u8my4vg" or just "Dwb4u8my4vg"'
                  />
                  <img
                    src="\static\images\SEARCH NOUNS GLASSES.svg"
                    alt="Icon"
                  />
                </FormControl>
              </form>
            </FallInPlace>
          </Hero>
          <Box
            height="600px"
            display={{ base: "none", lg: "block" }}
            left={{ lg: "60%", xl: "55%" }}
            width="80vw"
            height="auto"
            maxW="1100px"
            margin="0 auto"
            opacity="1"
          >
            <FallInPlace delay={1}>
              <Box overflow="hidden" height="100%">
                <Image
                  src="/static/images/HERO IMG.png"
                  layout="fixed"
                  width={1200}
                  height={762}
                  alt="Screenshot of a ListPage in Saas UI Pro"
                  quality="100"
                  priority
                />
              </Box>
            </FallInPlace>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Home;
