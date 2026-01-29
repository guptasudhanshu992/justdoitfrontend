import {
  Box,
  Heading,
  Text,
  Image,
  Code,
  UnorderedList,
  OrderedList,
  ListItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link,
  AspectRatio,
  useColorModeValue,
} from "@chakra-ui/react";

/**
 * Renders Editor.js content blocks
 * 
 * @param {Object} props
 * @param {Object} props.content - Editor.js output data with blocks
 */
export default function BlockRenderer({ content }) {
  const textColor = useColorModeValue("gray.900", "gray.50");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const codeBg = useColorModeValue("gray.100", "gray.700");
  const quoteBorder = useColorModeValue("blue.500", "blue.400");
  const tableBorder = useColorModeValue("gray.200", "gray.600");

  // Handle legacy plain text content
  if (typeof content === "string") {
    return (
      <Box>
        {content.split("\n\n").map((paragraph, index) => (
          <Text key={index} mb={6} color={textColor} lineHeight="1.8">
            {paragraph}
          </Text>
        ))}
      </Box>
    );
  }

  // Handle Editor.js JSON content
  if (!content || !content.blocks || !Array.isArray(content.blocks)) {
    return (
      <Text color={subtextColor} fontStyle="italic">
        No content available
      </Text>
    );
  }

  const renderBlock = (block, index) => {
    const { type, data } = block;

    switch (type) {
      case "header":
        const HeadingTag = `h${data.level || 2}`;
        const headingSizes = {
          1: "2xl",
          2: "xl",
          3: "lg",
          4: "md",
          5: "sm",
          6: "xs",
        };
        return (
          <Heading
            key={index}
            as={HeadingTag}
            size={headingSizes[data.level] || "lg"}
            fontWeight="700"
            mt={8}
            mb={4}
            color={textColor}
            dangerouslySetInnerHTML={{ __html: data.text }}
          />
        );

      case "paragraph":
        return (
          <Text
            key={index}
            mb={6}
            color={textColor}
            lineHeight="1.8"
            dangerouslySetInnerHTML={{ __html: data.text }}
            sx={{
              "& a": {
                color: "blue.500",
                textDecoration: "underline",
              },
              "& code": {
                bg: codeBg,
                px: 2,
                py: 1,
                borderRadius: "sm",
                fontSize: "sm",
              },
              "& mark": {
                bg: "yellow.200",
                px: 1,
              },
            }}
          />
        );

      case "list":
        const ListComponent = data.style === "ordered" ? OrderedList : UnorderedList;
        return (
          <ListComponent key={index} pl={6} mb={6} color={textColor}>
            {data.items.map((item, itemIndex) => (
              <ListItem
                key={itemIndex}
                mb={2}
                lineHeight="1.8"
                dangerouslySetInnerHTML={{ __html: item }}
              />
            ))}
          </ListComponent>
        );

      case "quote":
        return (
          <Box
            key={index}
            borderLeft="4px solid"
            borderColor={quoteBorder}
            pl={4}
            py={2}
            my={6}
          >
            <Text
              fontStyle="italic"
              color={textColor}
              fontSize="lg"
              lineHeight="1.8"
              dangerouslySetInnerHTML={{ __html: data.text }}
            />
            {data.caption && (
              <Text color={subtextColor} fontSize="sm" mt={2}>
                — {data.caption}
              </Text>
            )}
          </Box>
        );

      case "code":
        return (
          <Box
            key={index}
            as="pre"
            bg={codeBg}
            p={4}
            borderRadius="md"
            overflowX="auto"
            mb={6}
          >
            <Code display="block" bg="transparent" color={textColor}>
              {data.code}
            </Code>
          </Box>
        );

      case "image":
        return (
          <Box key={index} my={6}>
            <Image
              src={data.file?.url || data.url}
              alt={data.caption || "Blog image"}
              borderRadius="md"
              maxW="100%"
              mx="auto"
              display="block"
              loading="lazy"
            />
            {data.caption && (
              <Text
                textAlign="center"
                color={subtextColor}
                fontSize="sm"
                mt={2}
                fontStyle="italic"
              >
                {data.caption}
              </Text>
            )}
          </Box>
        );

      case "embed":
        return (
          <Box key={index} my={6}>
            <AspectRatio ratio={16 / 9}>
              <iframe
                src={data.embed}
                title={data.caption || "Embedded content"}
                allowFullScreen
                style={{ borderRadius: "8px" }}
              />
            </AspectRatio>
            {data.caption && (
              <Text
                textAlign="center"
                color={subtextColor}
                fontSize="sm"
                mt={2}
              >
                {data.caption}
              </Text>
            )}
          </Box>
        );

      case "table":
        return (
          <Box key={index} overflowX="auto" mb={6}>
            <Table
              variant="simple"
              border="1px solid"
              borderColor={tableBorder}
            >
              {data.withHeadings && data.content.length > 0 && (
                <Thead>
                  <Tr>
                    {data.content[0].map((cell, cellIndex) => (
                      <Th
                        key={cellIndex}
                        borderColor={tableBorder}
                        color={textColor}
                        dangerouslySetInnerHTML={{ __html: cell }}
                      />
                    ))}
                  </Tr>
                </Thead>
              )}
              <Tbody>
                {data.content.slice(data.withHeadings ? 1 : 0).map((row, rowIndex) => (
                  <Tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <Td
                        key={cellIndex}
                        borderColor={tableBorder}
                        color={textColor}
                        dangerouslySetInnerHTML={{ __html: cell }}
                      />
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        );

      case "warning":
        return (
          <Alert
            key={index}
            status="warning"
            variant="left-accent"
            my={6}
            borderRadius="md"
          >
            <AlertIcon />
            <Box>
              {data.title && (
                <AlertTitle fontWeight="600">{data.title}</AlertTitle>
              )}
              {data.message && (
                <AlertDescription>{data.message}</AlertDescription>
              )}
            </Box>
          </Alert>
        );

      case "linkTool":
        return (
          <Box
            key={index}
            as={Link}
            href={data.link}
            isExternal
            display="block"
            p={4}
            my={6}
            border="1px solid"
            borderColor={tableBorder}
            borderRadius="md"
            _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
          >
            <Text fontWeight="600" color={textColor}>
              {data.meta?.title || data.link}
            </Text>
            {data.meta?.description && (
              <Text fontSize="sm" color={subtextColor} mt={1}>
                {data.meta.description}
              </Text>
            )}
            <Text fontSize="xs" color="blue.500" mt={2}>
              {data.link}
            </Text>
          </Box>
        );

      case "delimiter":
        return (
          <Box key={index} textAlign="center" my={8}>
            <Text fontSize="2xl" color={subtextColor}>
              * * *
            </Text>
          </Box>
        );

      default:
        // Fallback for unknown block types
        console.warn(`Unknown block type: ${type}`);
        return (
          <Box key={index} p={4} bg={codeBg} borderRadius="md" mb={6}>
            <Text color={subtextColor} fontSize="sm">
              Unsupported content block: {type}
            </Text>
          </Box>
        );
    }
  };

  return (
    <Box className="blog-content">
      {content.blocks.map((block, index) => renderBlock(block, index))}
    </Box>
  );
}
