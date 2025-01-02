import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './TreeComponent.css';

const TreeComponent = () => {
    const [treeData, setTreeData] = useState([]);
    const [newPerson, setNewPerson] = useState('');
    const [parentId, setParentId] = useState(null);
    const [editName, setEditName] = useState('');
    const [selectedNode, setSelectedNode] = useState(null); // State for selected node for editing

    const fetchPersons = useCallback(() => {
        axios.get('http://localhost:8000/api/persons/')
            .then(response => {
                setTreeData(formatData(response.data));
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    useEffect(() => {
        fetchPersons();
    }, [fetchPersons]);

    const formatData = (data) => {
        const map = {};
        data.forEach(item => {
            if (!map[item.id]) {
                map[item.id] = { ...item, children: [] };
            } else {
                map[item.id] = { ...map[item.id], ...item };
            }

            if (item.parent) {
                if (!map[item.parent]) {
                    map[item.parent] = { children: [] };
                }
                map[item.parent].children.push(map[item.id]);
            }
        });

        const tree = [];
        data.forEach(item => {
            if (!item.parent) {
                tree.push(map[item.id]);
            }
        });
        return tree;
    };

    const addPerson = () => {
        const payload = { name: newPerson, parent: parentId || null };
        axios.post('http://localhost:8000/api/persons/', payload)
            .then(response => {
                setNewPerson('');
                setParentId(null);
                fetchPersons();
            })
            .catch(error => {
                console.error('Error adding person:', error);
            });
    };

    const deletePerson = (id) => {
        axios.delete(`http://localhost:8000/api/persons/${id}/`)
            .then(response => {
                fetchPersons();
                setSelectedNode(null); // Clear selected node after delete
            })
            .catch(error => {
                console.error('Error deleting person:', error);
            });
    };

    const editPersonName = (person) => {
        setSelectedNode(person); // Set the selected node when user clicks edit
        setEditName(person.name); // Pre-fill the edit name field
    };

    const updatePerson = () => {
        axios.put(`http://localhost:8000/api/persons/${selectedNode.id}/`, { name: editName, parent: selectedNode.parent })
            .then(response => {
                setSelectedNode(null); // Clear selected node after update
                setEditName('');
                fetchPersons();
            })
            .catch(error => {
                console.error('Error updating person:', error);
            });
    };

    return (
        <div>
            <h2>Add Person</h2>
            <div className="add-person-form">
                <input
                    type="text"
                    value={newPerson}
                    onChange={(e) => setNewPerson(e.target.value)}
                    placeholder="Enter name"
                />
                <input
                    type="number"
                    value={parentId || ''}
                    onChange={(e) => setParentId(Number(e.target.value))}
                    placeholder="Enter parent ID"
                />
                <button className="add" onClick={addPerson}>Add</button>
            </div>

            {selectedNode && (
                <div>
                    <h2>Edit Person</h2>
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter new name"
                    />
                    <button className="edit" onClick={updatePerson}>Update</button>
                    <button className="delete" onClick={() => setSelectedNode(null)}>Cancel</button>
                </div>
            )}

            <div className="tree">
                <Tree
                    data={treeData}
                    deletePerson={deletePerson}
                    editPersonName={editPersonName}
                    setSelectedNode={setSelectedNode} // Pass setSelectedNode as a prop
                    selectedNode={selectedNode} // Pass selectedNode as a prop
                />
            </div>
        </div>
    );
};

const Tree = ({ data, deletePerson, editPersonName, setSelectedNode, selectedNode }) => {
    return (
        <ul>
            {data.map(node => (
                <TreeNode
                    key={node.id}
                    node={node}
                    deletePerson={deletePerson}
                    editPersonName={editPersonName}
                    setSelectedNode={setSelectedNode} // Pass setSelectedNode to TreeNode
                    selectedNode={selectedNode} // Pass selectedNode to TreeNode
                />
            ))}
        </ul>
    );
};

const TreeNode = ({ node, deletePerson, editPersonName, setSelectedNode, selectedNode }) => {
    const handleNodeClick = () => {
        // When clicking a node's name, show the edit and delete buttons
        if (selectedNode && selectedNode.id === node.id) {
            // If already selected, toggle it off
            setSelectedNode(null);
        } else {
            // Select the node to show the edit and delete buttons
            setSelectedNode(node);
        }
    };

    const isSelected = selectedNode && selectedNode.id === node.id; // Check if this node is selected

    return (
        <li>
            {/* Clicking the node name will toggle the display of edit and delete buttons */}
            <a href="#" onClick={handleNodeClick} style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                {node.name} (ID: {node.id})
            </a>

            {/* Show edit and delete buttons only when the node is selected */}
            {isSelected && (
                <div>
                    <button className="edit" onClick={() => editPersonName(node)}>Edit</button>
                    {node.parent && (
                        <button className="delete" onClick={() => deletePerson(node.id)}>Delete</button>
                    )}
                </div>
            )}

            {node.children && (
                <ul>
                    {node.children.map(child => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            deletePerson={deletePerson}
                            editPersonName={editPersonName}
                            setSelectedNode={setSelectedNode} // Pass setSelectedNode to child nodes
                            selectedNode={selectedNode} // Pass selectedNode to child nodes
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default TreeComponent;
