import useStore from "mobx-store-utils"
import React from 'react'
import { observer } from "mobx-react-lite"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ExpandLessIcon from "@material-ui/icons/ExpandLess"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import Collapse from '@material-ui/core/Collapse'
import { makeAutoObservable } from "mobx"


interface CollapsibleListItemProps {
    initialCollapsed?: boolean
    label?: string
    icon?: React.ReactElement
    button?: React.ReactElement
    setStore?: (store: CollapsibleListItemStore) => any
}

export class CollapsibleListItemStore {
    constructor(sp: CollapsibleListItemProps) {
        this.collapsed = sp.initialCollapsed || false
        sp.setStore && sp.setStore(this)
        makeAutoObservable(this)
    }
    collapsed: boolean
     toggleOpen = () => {
        this.collapsed = !this.collapsed
    }
}
export const CollapsibleListItem = observer((props: React.PropsWithChildren<CollapsibleListItemProps>) => {
    const localStore = useStore(source => new CollapsibleListItemStore(source), props)

    return <>
        <ListItem button onClick={localStore.toggleOpen}>
            {props.icon && <ListItemIcon children={props.icon} />}
            <ListItemText primary={props.label} />
            
            {localStore.collapsed ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            {props.button}
        </ListItem>
        <Collapse in={localStore.collapsed}>
            {props.children}
        </Collapse>
    </>
})