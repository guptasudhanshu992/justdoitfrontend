import { Box, useColorModeValue, Link } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const location = useLocation();
  const textColor = useColorModeValue("gray.700", "gray.300");
  const hoverBgColor = useColorModeValue("gray.100", "gray.700");
  const activeColor = useColorModeValue("blue.600", "blue.400");
  const activeBgColor = useColorModeValue("blue.50", "gray.700");

  const isActive = (path) => location.pathname === path;

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

      {/* Blog Link */}
      <Box mt={4}>
        <SidebarLink to="/admin/blog-posts">Blog</SidebarLink>
      </Box>

      {/* Categories Link */}
      <Box mt={2}>
        <SidebarLink to="/admin/categories">Categories</SidebarLink>
      </Box>

      {/* Tags Link */}
      <Box mt={2}>
        <SidebarLink to="/admin/tags">Tags</SidebarLink>
      </Box>

      {/* Media Link */}
      <Box mt={4}>
        <SidebarLink to="/admin/media">Media</SidebarLink>
      </Box>
    </>
  );
}
