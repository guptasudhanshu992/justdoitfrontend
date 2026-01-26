import { Box, Accordion, AccordionItem, AccordionButton, AccordionPanel, HStack, useColorModeValue, Link } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const location = useLocation();
  const textColor = useColorModeValue("gray.700", "gray.300");
  const hoverBgColor = useColorModeValue("gray.100", "gray.700");
  const activeColor = useColorModeValue("blue.600", "blue.400");
  const activeBgColor = useColorModeValue("blue.50", "gray.700");

  const isActive = (path) => location.pathname === path;
  
  // Check if any blog section route is active
  const isBlogSectionActive = () => {
    const blogPaths = ['/admin/blog-posts', '/admin/categories', '/admin/tags'];
    return blogPaths.some(path => location.pathname.startsWith(path));
  };

  const SidebarLink = ({ to, children }) => (
    <Link
      as={RouterLink}
      to={to}
      display="block"
      px={4}
      py={2}
      rounded="md"
      fontSize="sm"
      fontWeight={isActive(to) ? "700" : "500"}
      color={isActive(to) ? activeColor : textColor}
      bg={isActive(to) ? activeBgColor : "transparent"}
      transition="all 0.2s"
      _hover={{
        bg: hoverBgColor,
        color: activeColor,
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );

  return (
    <>
      {/* Dashboard Link */}
      <SidebarLink to="/admin">Dashboard</SidebarLink>

      {/* Blog Accordion */}
      <Accordion allowToggle mt={4} defaultIndex={isBlogSectionActive() ? [0] : []}>
      {/* Blog Section */}
      <AccordionItem border="none" mb={2}>
        <AccordionButton
          px={4}
          py={3}
          rounded="md"
          fontWeight="600"
          fontSize="sm"
          color={isBlogSectionActive() ? activeColor : textColor}
          _hover={{ bg: hoverBgColor }}
          _expanded={{ bg: hoverBgColor, color: activeColor }}
        >
          <Box flex="1" textAlign="left">
            Blog
          </Box>
          <Box ml={2}>▼</Box>
        </AccordionButton>

        <AccordionPanel pb={0} pt={2} pl={4}>
          <Box>
            <SidebarLink to="/admin/blog-posts">Blog Posts</SidebarLink>
            <SidebarLink to="/admin/categories">Categories</SidebarLink>
            <SidebarLink to="/admin/tags">Tags</SidebarLink>
          </Box>
        </AccordionPanel>
      </AccordionItem>
      </Accordion>
    </>
  );
}
