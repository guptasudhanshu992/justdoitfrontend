import { Box, Heading, VStack, Text, useColorModeValue, UnorderedList, ListItem } from "@chakra-ui/react";

export default function About() {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.900", "gray.50");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const sectionBgColor = useColorModeValue("white", "gray.800");

  const Section = ({ title, children }) => (
    <Box
      mb={8}
      pb={8}
      borderBottom="1px solid"
      borderColor={borderColor}
      _last={{ borderBottom: "none" }}
    >
      {title && (
        <Heading
          as="h2"
          size="lg"
          color={textColor}
          mb={4}
          fontWeight="700"
          letterSpacing="-0.5px"
        >
          {title}
        </Heading>
      )}
      {children}
    </Box>
  );

  const Paragraph = ({ children }) => (
    <Text
      fontSize="md"
      color={textColor}
      lineHeight="1.8"
      mb={4}
      fontWeight="400"
    >
      {children}
    </Text>
  );

  return (
    <VStack width="100%" align="stretch" spacing={0}>
      {/* Page Header */}
      <Box
        bg={bgColor}
        borderBottom="1px solid"
        borderColor={borderColor}
        py={12}
        px={{ base: 4, md: 8 }}
      >
        <Box maxW="900px" mx="auto" textAlign="center">
          <Heading
            as="h1"
            size="2xl"
            fontWeight="700"
            color={textColor}
            letterSpacing="-2px"
            mb={3}
          >
            About Price Action Repository
          </Heading>
          <Text
            fontSize="lg"
            color={subtextColor}
            fontWeight="500"
            letterSpacing="0.3px"
          >
            Where finance meets code, and markets tell a story
          </Text>
        </Box>
      </Box>

      {/* Content Area */}
      <Box
        flex={1}
        px={{ base: 4, md: 8 }}
        py={8}
        width="100%"
      >
        <Box maxW="900px" mx="auto">
          {/* Introduction */}
          <Section>
            <Paragraph>
              Price Action Repository was born at the intersection of two worlds that define me: computer science and finance.
            </Paragraph>

            <Paragraph>
              I've always believed that markets, much like code, follow patterns. They aren't random—they are reactions. Reactions to fear, greed, structure, liquidity, and information. Price action, at its core, is simply the market telling a story. This blog exists to decode that story in a way that is practical, transparent, and grounded in learning rather than hype.
            </Paragraph>

            <Paragraph>
              By profession and passion, I am an enthusiastic coder and an investment specialist. My background in computer science has shaped how I approach the markets: logically, systematically, and with a deep respect for data and structure. At the same time, finance has taught me humility—because no matter how elegant a system looks on paper, the market always has the final say.
            </Paragraph>

            <Paragraph>
              One thing I noticed early in my journey is that a large number of people actively seek professional trading and investment advice, often without fully understanding the tools, assumptions, or risks behind that advice. While I don't claim to be an all-knowing expert or a market wizard, I <Text as="span" fontWeight="700">do</Text> believe strongly in this:
              knowing the right tools, frameworks, and thought processes is far more powerful than blindly following tips.
            </Paragraph>

            <Paragraph fontWeight="600" color="blue.500">
              That belief is the foundation of this blog.
            </Paragraph>
          </Section>

          {/* Learning in Public */}
          <Section title="Learning in Public, Together">
            <Paragraph>
              Price Action Repository is not a place where I pretend to have everything figured out. Instead, it's a space where I learn in public.
            </Paragraph>

            <Paragraph>
              As I explore concepts—whether it's pure price action, market structure, volume behavior, indicators, trading psychology, or the use of technology and AI in market analysis—I document that learning here. Every article is a log of understanding gained, mistakes made, insights refined, and clarity achieved. If I learn something new today, it becomes tomorrow's blog post.
            </Paragraph>

            <Paragraph>
              In that sense, this repository grows with you.
            </Paragraph>

            <Paragraph>
              You'll find content that blends:
            </Paragraph>

            <UnorderedList mb={4} spacing={2}>
              <ListItem color={textColor}>Clean price action concepts</ListItem>
              <ListItem color={textColor}>Logical frameworks inspired by software engineering</ListItem>
              <ListItem color={textColor}>Data-driven thinking</ListItem>
              <ListItem color={textColor}>Real-world market observations</ListItem>
              <ListItem color={textColor}>And honest reflections on what works, what doesn't, and why</ListItem>
            </UnorderedList>

            <Paragraph fontWeight="600" color="blue.500">
              The goal isn't to give you signals. The goal is to help you think better about the market.
            </Paragraph>
          </Section>

          {/* Why This Blog Exists */}
          <Section title="Why This Blog Exists">
            <Paragraph>
              Markets can be overwhelming—filled with noise, opinions, and conflicting advice. Price Action Repository aims to cut through that noise by focusing on clarity, simplicity, and continuous improvement.
            </Paragraph>

            <Paragraph>
              Whether you're a beginner trying to understand charts, an intermediate trader refining your edge, or someone curious about how technology and finance can work together, this blog is designed to be a companion in your journey.
            </Paragraph>

            <Paragraph>
              I'm learning. You're learning. And together, we're building a repository—not of shortcuts—but of understanding.
            </Paragraph>

            <Paragraph fontWeight="700" fontSize="lg" color="blue.500" mt={6}>
              Welcome to Price Action Repository.
            </Paragraph>
          </Section>
        </Box>
      </Box>
    </VStack>
  );
}
