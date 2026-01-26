import { Flex, VStack } from "@chakra-ui/react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <VStack minH="100vh" spacing={0} align="stretch">
      <Header />
      <Flex flex={1} width="100%" align="stretch">
        {children}
      </Flex>
      <Footer />
    </VStack>
  );
}
