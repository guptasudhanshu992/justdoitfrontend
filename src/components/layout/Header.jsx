import { Box, Flex, Heading, HStack, Link, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const bgColor = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const activeColor = useColorModeValue("blue.600", "blue.400");

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children }) => (
    <Link
      as={RouterLink}
      to={to}
      px={3}
      py={2}
      fontSize="sm"
      fontWeight="600"
      letterSpacing="0.5px"
      color={isActive(to) ? activeColor : textColor}
      position="relative"
      transition="all 0.3s ease"
      _hover={{
        color: activeColor,
        textDecoration: "none",
      }}
      _after={{
        content: '""',
        position: "absolute",
        bottom: "-2px",
        left: 0,
        right: 0,
        height: "2px",
        bg: activeColor,
        transform: isActive(to) ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "transform 0.3s ease",
      }}
    >
      {children}
    </Link>
  );

  return (
    <Box
      as="header"
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      py={4}
      sticky="top"
      zIndex={100}
      boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
      px={{ base: 4, md: 8 }}
    >
      <Flex justify="space-between" align="center" width="100%" maxW="1400px" mx="auto">
        {/* Logo */}
        <RouterLink to="/" style={{ textDecoration: "none" }}>
          <Heading
            as="h1"
            size="md"
            letterSpacing="-1px"
            fontWeight="700"
            color={textColor}
            cursor="pointer"
            transition="color 0.3s ease"
            _hover={{ color: activeColor }}
          >
            JustDo
          </Heading>
        </RouterLink>

        {/* Navigation Links */}
        <HStack as="nav" spacing={1}>
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/about">About</NavLink>
        </HStack>
      </Flex>
    </Box>
  );
}
