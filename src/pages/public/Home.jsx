import { useEffect, useState } from "react";
import { Box, Heading, useColorModeValue, Spinner, Text } from "@chakra-ui/react";
import { API_BASE_URL } from '../config/api';

export default function Home() {
  const textColor = useColorModeValue("gray.900", "gray.50");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch message");
        }
        const data = await response.text();
        setMessage(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, []);

  return (
    <Box py={12} px={{ base: 4, md: 8 }} width="100%">
      <Box maxW="7xl" mx="auto">
        <Heading as="h1" size="2xl" mb={8} color={textColor} textAlign="center">
          Welcome to JustDoit
        </Heading>

        {loading && (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" color="blue.500" />
          </Box>
        )}

        {error && (
          <Box
            p={6}
            rounded="lg"
            bg="red.100"
            color="red.800"
            textAlign="center"
          >
            <Text fontWeight="600">Error connecting to API</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
        )}

        {message && !loading && (
          <Box
            p={8}
            rounded="lg"
            bg={useColorModeValue("blue.50", "blue.900")}
            textAlign="center"
            borderLeft="4px solid"
            borderColor="blue.500"
          >
            <Text fontSize="xl" fontWeight="600" color={textColor}>
              {message}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
