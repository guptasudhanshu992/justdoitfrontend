import { Box, Container, Flex, HStack, Link, Text, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function Footer() {
  const bgColor = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.500");
  const hoverColor = useColorModeValue("blue.600", "blue.400");

  const currentYear = new Date().getFullYear();

  const FooterLink = ({ to, children }) => (
    <Link
      as={RouterLink}
      to={to}
      fontSize="sm"
      fontWeight="500"
      color={textColor}
      transition="color 0.3s ease"
      _hover={{
        color: hoverColor,
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );

  return (
    <Box
      as="footer"
      bg={bgColor}
      borderTop="1px solid"
      borderColor={borderColor}
      mt={16}
      py={8}
      boxShadow="0 -1px 3px rgba(0, 0, 0, 0.05)"
      px={{ base: 4, md: 8 }}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        gap={8}
        width="100%"
        maxW="1400px"
        mx="auto"
      >
        {/* Left Section - Copyright */}
        <Text fontSize="sm" fontWeight="500" color={textColor}>
          JustDo © {currentYear} JustDo It. All rights reserved.
        </Text>

        {/* Right Section - Navigation Links */}
        <HStack spacing={6} flex={{ base: "initial", md: "1" }} justify={{ base: "flex-start", md: "flex-end" }}>
          <FooterLink to="/blog">Blog</FooterLink>
          <FooterLink to="/about">About</FooterLink>
        </HStack>
      </Flex>
    </Box>
  );
}
