import { Box, Flex, VStack, Heading, useColorModeValue } from "@chakra-ui/react";

export default function AdminLayout({ sidebar, children }) {
  const bgColor = useColorModeValue("white", "gray.900");
  const sidebarBgColor = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Flex width="100%" minH="calc(100vh - 80px)" bg={bgColor}>
      {/* Sidebar */}
      <Box
        width={{ base: "100%", md: "250px" }}
        bg={sidebarBgColor}
        borderRight="1px solid"
        borderColor={borderColor}
        p={6}
        display={{ base: "none", md: "block" }}
        overflowY="auto"
      >
        <Heading as="h3" size="md" mb={6} fontWeight="700">
          Admin Menu
        </Heading>
        {sidebar}
      </Box>

      {/* Main Content Area */}
      <Flex
        flex={1}
        direction="column"
        width={{ base: "100%", md: "calc(100% - 250px)" }}
        p={6}
        overflowY="auto"
      >
        <Box maxW="1400px" width="100%">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
