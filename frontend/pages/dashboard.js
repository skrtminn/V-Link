await fetchLinks() // Refresh the links
      setSelectedLinks([])
      setBulkTagInput('')
      setShowBulkTagModal(false)
      alert('Tags updated successfully')
=======
      await Promise.all(updatePromises)
      await fetchLinks() // Refresh the links
      setSelectedLinks([])
      setBulkTagInput('')
      setShowBulkTagModal(false)
      toast.success('Tags updated successfully')
