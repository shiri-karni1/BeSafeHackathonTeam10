/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the message
 *         text:
 *           type: string
 *           description: The message content
 *         sender:
 *           type: string
 *           description: The username of the sender
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The time the message was sent
 *     Chat:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - username
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the chat
 *         title:
 *           type: string
 *           description: The title of the chat
 *         content:
 *           type: string
 *           description: The detailed content of the chat
 *         username:
 *           type: string
 *           description: The user who started the chat
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The time the chat was created
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *       example:
 *         id: d5fE_asz
 *         title: How do I deal with a mean friend?
 *         content: My friend keeps making fun of me...
 *         username: Sarah123
 *         timestamp: 2023-10-27T10:00:00Z
 *         messages: []
 */

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: The chats managing API
 */

/**
 * @swagger
 * /chats:
 *   get:
 *     summary: Returns the list of all chats
 *     tags: [Chats]
 *     responses:
 *       200:
 *         description: The list of the chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 */

/**
 * @swagger
 * /chats/{id}:
 *   get:
 *     summary: Get a chat by id
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The chat id
 *     responses:
 *       200:
 *         description: The chat description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       404:
 *         description: The chat was not found
 */

/**
 * @swagger
 * /chats:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - username
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       201:
 *         description: The chat was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Missing required fields or Content blocked by Safety Agent
 */

/**
 * @swagger
 * /chats/{id}/messages:
 *   post:
 *     summary: Add a message to a chat
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The chat id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - sender
 *             properties:
 *               text:
 *                 type: string
 *               sender:
 *                 type: string
 *     responses:
 *       201:
 *         description: The message was successfully added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Message blocked by Safety Agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Message blocked by Safety Agent"
 *                 feedback:
 *                   type: string
 *                   example: "This message is hurtful and violates our community guidelines."
 *                 reason:
 *                   type: string
 *                   example: "Bullying"
 *       404:
 *         description: Chat not found
 */
