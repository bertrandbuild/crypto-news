/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import type { NextPage } from "next";
import Image from "next/image";

import {
  Box,
  Container,
  FormControl,
  Heading,
  Input,
  Text,
  Stack,
} from "@chakra-ui/react";
import { Hero } from "components/hero";
import { FallInPlace } from "components/motion/fall-in-place";
import { extractVideoId, getSummarizedTranscript, getTranscript } from "utils/utils";
import { useState } from "react";
import { Loading } from "@saas-ui/react";
import { fontSizes } from "theme/foundations/typography";
import { getFileUrl, uploadText } from "utils/filecoin";
import Link from "next/link";

const aiInsights = {
  "Market_News": [
      "Bitcoin is down 3.94%",
      "Bitcoin is in a bullish trend as long as it doesn't close a week below 58k",
      "Bitcoin's scenario of pumping past 70k and not revisiting it did not materialize; instead, a more sideways scenario is present with Bitcoin stuck at around 69-70k",
      "Discussion of historical patterns suggesting current market dynamics are not unusual",
      "Reference to major dumps and recoveries, highlighting the volatile nature of the market",
  ],
  "Technical_Analysis": [
      "Bullish as long as Bitcoin stays above 58k",
      "Bitcoin is currently stuck at around 69-70k, facing resistance at these levels",
      "A flag formation target for Bitcoin was met, indicating a potential sideways movement for the week",
      "Long term target for Bitcoin is around 90k based on doubling the price from the last base of 45k"
  ],
  "Fear_and_Greed_Indicator": 85
}

const Home: NextPage = () => {
  const [content, setContent] = useState();
  const [isLoading, setIsLoading] = useState();
  const [isLoaded, setIsLoaded] = useState();

  const context = {
    setContent,
    setIsLoading,
    setIsLoaded,
    content,
    isLoading,
    isLoaded
  };

  return (
    <Box className="flex flex-col min-h-screen">
      {isLoaded ? <VideoContent context={context} /> : <HeroSection context={context} />}
      {isLoading ? <Loading /> : null}
    </Box>
  );
};

const HeroSection: React.FC = ({ context }) => {
  const { setContent, setIsLoading, setIsLoaded } = context;
  const handleSubmit = async (videoUrl) => {
    setIsLoading(true);
    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      try {
        const isDev = false;
        if (isDev){
          setContent(aiInsights);
        } else {
          const transcript = await getTranscript(videoId);
          const aiInsights = await getSummarizedTranscript(transcript)
          const transcriptCid = await uploadText(JSON.stringify(transcript));
          const aiInsightsCid = await uploadText(JSON.stringify(aiInsights));
          window.setTimeout(() => {
            const content = {
              ...aiInsights,
              analyzisFileUrl: getFileUrl(aiInsightsCid?.data.Hash),
              transcriptFileUrl: getFileUrl(transcriptCid?.data.Hash)
            }
            setContent(content);
          }, 100)
        }

        setContent(aiInsights);
        // TODO
        // const tx = saveToContract(videoId, transcriptCid, insightCid)
        // console.log(tx);
        window.setTimeout(() => {
          setIsLoading(false);
          setIsLoaded(true);
        }, 100);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    }
  };

  return (
    <Box
      position="relative"
      overflow="hidden"
      backgroundImage={`url("static/images/SKY_BG_2.png")`}
      backgroundSize="cover"
    >
      <Container maxW="container.xl" pt={{ base: 10, lg: 20 }} pb="40">
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
                <FormControl mt="10" style={{ position: "relative" }}>
                  <Input
                    border="solid 3px #000"
                    backgroundColor="rgba(255, 255, 255, 0.8)"
                    height="70"
                    type="text"
                    name="videoUrl"
                    placeholder='Paste a youtube url'
                    // value={"https://www.youtube.com/watch?v=8FHWcNOZ95E"}
                  />
                  <img
                    style={{ position: "absolute", right: "20px", top: "22px", transform: "rotateY(175deg)" }}
                    src="\static\images\SEARCH_NOUNS_GLASSES.svg"
                    alt="Icon"
                  />
                </FormControl>
              </form>
            </FallInPlace>
          </Hero>
          <Box
            height="600px"
            display={{ lg: "block" }}
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
                  src="/static/images/HERO_IMG.png"
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

const VideoContent: React.FC = ({ context }) => {
  const { content } = context;
  return (
    <Box
      position="relative"
      overflow="hidden"
      backgroundImage={`url("static/images/SKY_BG_2.png")`}
      backgroundSize="cover"
    >
      <Container maxW="container.xl" pt={{ base: 40, lg: 10 }} pb="40" mt="70">
        <Stack direction={{ base: "column", md: "row" }}>
          <Box
            display={{ lg: "block" }}
            left={{ lg: "60%", xl: "55%" }}
            width="45vw"
            height="auto"
            maxW="1100px"
            margin="0 auto"
            opacity="1"
          >
            {content.Fear_and_Greed_Indicator && (
              <FallInPlace delay={0}>
              <Box>
                <Heading size="xl" mt={2}>Video Sentiment</Heading>
                <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', padding: '20px', position: 'relative'}}>
                  <div style={{width: '100%', height: '30px', background: '#d30606'}}></div>
                  <div style={{width: '100%', height: '30px', background: '#ea6d38'}}></div>
                  <div style={{width: '100%', height: '30px', background: '#ebbc53'}}></div>
                  <div style={{width: '100%', height: '30px', background: '#97d434'}}></div>
                  <div style={{width: '100%', height: '30px', background: '#00d83c'}}></div>
                  <div style={{width: '37px', height: '37px', border: "5px solid gray", position: 'absolute', background: 'white', top: '17px', left: `calc(${content.Fear_and_Greed_Indicator}% - 37px)`}}>
                    <div style={{width: '15px', height: '27px', background: '#1b1b1b', position: 'absolute', top: '0', left: '12px'}}></div>
                  </div>
                </div>
                {(content.Fear_and_Greed_Indicator < 20) && (
                  <img
                    src="\static\images\SUPER_BEARISH_NOUNS.svg"
                    alt="Icon"
                    style={{width: '80%', margin: '0 auto' }}
                  />
                )}
                {(content.Fear_and_Greed_Indicator >= 20 && content.Fear_and_Greed_Indicator < 40) && (
                  <img
                    src="\static\images\BEARISH_NOUNS.svg"
                    alt="Icon"
                    style={{width: '80%', margin: '0 auto' }}
                  />
                )}
                {(content.Fear_and_Greed_Indicator >= 40 && content.Fear_and_Greed_Indicator < 60) && (
                  <img
                    src="\static\images\NEUTRAL_NOUNS.svg"
                    alt="Icon"
                    style={{width: '80%', margin: '0 auto' }}
                  />
                )}
                {(content.Fear_and_Greed_Indicator >= 60 && content.Fear_and_Greed_Indicator < 80) && (
                  <img
                    src="\static\images\BULLISH_NOUNS.svg"
                    alt="Icon"
                    style={{width: '80%', margin: '0 auto' }}
                  />
                )}
                {(content.Fear_and_Greed_Indicator >= 80) && (
                  <img
                    src="\static\images\SUPER_BULLISH_NOUNS.svg"
                    alt="Icon"
                    style={{width: '80%', margin: '0 auto' }}
                  />
                )}
              </Box>
            </FallInPlace>
            )}
          </Box>
          <Box
            height="600px"
            display={{ lg: "block" }}
            left={{ lg: "60%", xl: "55%" }}
            width="50vw"
            height="auto"
            maxW="1100px"
            margin="0 0 0 25px"
            opacity="1"
          >
            <FallInPlace delay={1}>
              <Box>
                <Heading size="xl">Summary</Heading>
                <Heading size="md" mt={2}>Fundamental Analysis</Heading>
                {content.Market_News.map((item, index) => (
                  <li sx={undefined} key={index}>
                    {item}
                  </li>
                ))}
                <Heading size="md" mt={2}>Technical Analysis</Heading>
                {content.Technical_Analysis.map((item, index) => (
                  <li sx={undefined} key={index}>
                    {item}
                  </li>
                ))}
              </Box>
              <Box style={{marginTop: '50px', width: '100%', display: 'flex', justifyContent: 'right'}}>
                <Text>Verify the data : <Link style={{textDecoration: 'underline'}} target='_blank' href={`${content.transcriptFileUrl}`}>Transcript</Link> - <Link target='_blank' href={`${content.analyzisFileUrl}`} style={{textDecoration: 'underline'}}>Analyzis</Link></Text>
                <img
                    style={{ position: "relative", marginLeft: "20px", transform: "rotateY(175deg)" }}
                    src="\static\images\SEARCH_NOUNS_GLASSES.svg"
                    alt="Icon"
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
