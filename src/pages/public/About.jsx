import { Box, Heading, VStack, Text, useColorModeValue } from "@chakra-ui/react";

export default function About() {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.900", "gray.50");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

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
        <Box maxW="1400px" mx="auto" textAlign="center">
          <Heading
            as="h1"
            size="2xl"
            fontWeight="700"
            color={textColor}
            letterSpacing="-2px"
            mb={3}
          >
            About
          </Heading>
          <Text
            fontSize="lg"
            color={subtextColor}
            fontWeight="500"
            letterSpacing="0.3px"
          >
            This is where you get to know me and my purpose
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
        <Box maxW="1400px" mx="auto">
          {/* Placeholder for about content */}
          <Box
            textAlign="center"
            py={12}
            color={textColor}
            opacity={0.6}
          >
            About content coming soon...
          </Box>
        </Box>
      </Box>
    </VStack>
  );
}
