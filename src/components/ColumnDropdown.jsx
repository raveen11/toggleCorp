import React, { useState, useRef, useEffect } from 'react';
import { DropdownArrow, DropdownButton, DropdownContainer, DropdownMenu, DropdownOption } from './style';


export const ColumnDropdown = ({ columns, onSelect,column, placeholder = 'Select Column' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const dropdownRef = useRef(null);
    const handleSelect = (column) => {
        setSelected(column);
        onSelect(column);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <DropdownContainer ref={dropdownRef}>
            <DropdownButton $bgColor={selected?.bgColor || column?.bgColor} onClick={() => setIsOpen(!isOpen)}>
                {selected ? selected.name : placeholder}
                <DropdownArrow $isOpen={isOpen} />
            </DropdownButton>
            <DropdownMenu $isOpen={isOpen}>
                {columns.map((column) => (
                    <DropdownOption key={column.id} onClick={() => handleSelect(column)}>
                        {column.name}
                    </DropdownOption>
                ))}
            </DropdownMenu>
        </DropdownContainer>
    );
};