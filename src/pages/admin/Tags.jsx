import { Box, Heading, useColorModeValue } from "@chakra-ui/react";
import AdminLayout from "../../components/layout/AdminLayout";
import AdminSidebar from "../../components/layout/AdminSidebar";

export default function Tags() {
  const textColor = useColorModeValue("gray.900", "gray.50");

  return (
    <Box width="100%">
      <AdminLayout>
        <AdminSidebar />
      </AdminLayout>
      <Box p={6} maxW="1400px" mx="auto">
        <Heading as="h2" size="lg" mb={4} color={textColor}>
          Tags
        </Heading>
        <Box color={textColor} opacity={0.6}>
          Tags management coming soon...
        </Box>
      </Box>
    </Box>
  );
}
