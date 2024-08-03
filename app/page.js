'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { firestore } from '@/firebase'
import { Box, Modal, Typography, Stack, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ThemeProvider, createTheme } from '@mui/material'
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from 'firebase/firestore'

const theme = createTheme({
  palette: {
    primary: {
      main: '#D4AF37', // Gold color from the image
    },
    secondary: {
      main: '#004d40', // Teal color from the image
    },
    success: {
      main: '#008000', // Green color
    },
    error: {
      main: '#FF0000', // Red color
    },
  },
  typography: {
    h2: {
      color: '#D4AF37', // Gold color for headings
    },
  },
})

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1) // State for quantity in modal
  const [itemQuantities, setItemQuantities] = useState({}) // State for quantities of each item
  const [searchQuery, setSearchQuery] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item, quantity) => {
    if (item.trim() === '' || quantity <= 0) return

    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data()
      await setDoc(docRef, { quantity: existingQuantity + quantity })
    } else {
      await setDoc(docRef, { quantity })
    }

    setItemQuantities(prev => ({ ...prev, [item]: 0 })) // Reset input quantity for the item
    await updateInventory()
  }

  const removeItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data()
      if (existingQuantity <= quantity) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: existingQuantity - quantity })
      }
    }

    setItemQuantities(prev => ({ ...prev, [item]: 0 })) // Reset input quantity for the item
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={2}
        bgcolor="#004d40" // Background teal color from the image
        color="#ffffff" // White text color
      >
        <Box mb={2} mt={2}> {/* Added margin-top to move the logo down */}
          <Image src="/logo.png" alt="Logo" width={100} height={100} />
        </Box>
        <Typography variant="h2" mb={2}>Ni'ma Navigator</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            variant="outlined"
            placeholder="New Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            InputProps={{
              style: { color: '#ffffff' }, // White text in input field
            }}
            sx={{
              '.MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#D4AF37', // Gold border color
                },
                '&:hover fieldset': {
                  borderColor: '#D4AF37',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#D4AF37',
                },
              },
            }}
          />
          <Button variant="contained" color="primary" onClick={handleOpen}>Add New Item</Button>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" mt={2}>
          <TextField
            variant="outlined"
            placeholder="Search Items"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              style: { color: '#ffffff' }, // White text in input field
            }}
            sx={{
              '.MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#D4AF37', // Gold border color
                },
                '&:hover fieldset': {
                  borderColor: '#D4AF37',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#D4AF37',
                },
              },
            }}
          />
        </Stack>
        <TableContainer component={Paper} sx={{ mt: 2, width: '80%', backgroundColor: '#004d40' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#ffffff' }}>Item</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Current Amount</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Increment Factor</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.name}>
                  <TableCell component="th" scope="row" sx={{ color: '#ffffff' }}>{item.name}</TableCell>
                  <TableCell align="center" sx={{ color: '#ffffff' }}>{item.quantity}</TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      value={itemQuantities[item.name] !== undefined ? itemQuantities[item.name] : 0}
                      onChange={(e) => setItemQuantities(prev => ({ ...prev, [item.name]: Number(e.target.value) }))}
                      inputProps={{ min: 0 }}
                      sx={{ width: '60px', color: '#ffffff', '.MuiOutlinedInput-root': { '& fieldset': { borderColor: '#D4AF37' } } }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button variant="contained" color="success" onClick={() => addItem(item.name, itemQuantities[item.name] !== undefined ? itemQuantities[item.name] : 0)}>Add</Button>
                    <Button variant="contained" color="error" onClick={() => removeItem(item.name, itemQuantities[item.name] !== undefined ? itemQuantities[item.name] : 0)} sx={{ ml: 1 }}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Typography variant="h6">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Item Name"
                InputProps={{
                  style: { color: '#000000' },
                }}
                sx={{
                  '.MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#D4AF37', // Gold border color
                    },
                    '&:hover fieldset': {
                      borderColor: '#D4AF37',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#D4AF37',
                    },
                  },
                }}
              />
              <TextField
                type="number"
                variant="outlined"
                fullWidth
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Number(e.target.value))}
                inputProps={{ min: 0 }}
                placeholder="Quantity"
                InputProps={{
                  style: { color: '#000000' },
                }}
                sx={{
                  '.MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#D4AF37', // Gold border color
                    },
                    '&:hover fieldset': {
                      borderColor: '#D4AF37',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#D4AF37',
                    },
                  },
                }}
              />
              <Button variant="contained" color="primary" onClick={() => addItem(itemName, itemQuantity)}>Add</Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  )
}
