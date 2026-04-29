import styled from 'styled-components';

export const DropdownContainer = styled.div`
    position: relative;
    display: inline-block;
`;

export const DropdownButton = styled.button`
    padding: 8px 12px;
    background-color: ${props=>props?.$bgColor || 'white'};
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;

`;

export const DropdownArrow = styled.span`
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 6px solid #333;
    transition: transform 0.2s ease;
    transform: ${props => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

export const DropdownMenu = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    min-width: 150px;
    display: ${props => (props.$isOpen ? 'block' : 'none')};
    margin-top: 5px;
`;

export const DropdownOption = styled.div`
    padding: 10px 12px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background-color: #f5f5f5;
    }
`;