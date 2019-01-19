import { Icon } from '@nitive/whitepaper-react/_components/icon'
import { PtList, PtListItem } from '@nitive/whitepaper-react/_components/pt-list'
import { PtTable, PtTableCol, PtTableRow } from '@nitive/whitepaper-react/_components/pt-table'
import { Text } from '@nitive/whitepaper-react/_components/text'
import { Theme } from '@nitive/whitepaper-react/_components/theme'
import { TplGrid, TplGridFraction } from '@nitive/whitepaper-react/_components/tpl-grid'
import { TplLayout, TplLayoutContainer } from '@nitive/whitepaper-react/_components/tpl-layout'
import React from 'react'
import { render } from 'react-dom'

function About() {
  return (
    <section>
      <Text type='h1' size='xxxxl' weight='bold' view='primary'>
        Whitepaper React
      </Text>
      <Text
        type='blockquote'
        size='l'
        weight='regular'
        view='secondary'
        short='medium'
        attrs={{ style: { marginLeft: 0 } }}
      >
        Автоматически сгенерированная библиотека для работы с Whitepaper
      </Text>
    </section>
  )
}

function Example(props) {
  return (
    <TplGridFraction style={{ border: '1px solid var(--color-bg-border)', height: '100%', padding: '20px' }}>
      {props.children}
    </TplGridFraction>
  )
}

function IconsExample() {
  return (
    <Example>
      <Text tag='h3' type='p' size='xxl'>
        Иконки
      </Text>
      <Icon name='check-circle' size='m' />
      <Icon name='cheque-progress' size='m' />
      <Icon name='devices' size='m' />
    </Example>
  )
}

function ListExample() {
  return (
    <Example>
      <Text tag='h3' type='p' size='xxl'>
        Списки
      </Text>
      <PtList>
        <PtListItem indentA='s'>Chrome</PtListItem>
        <PtListItem indentA='s'>Firefox</PtListItem>
        <PtListItem indentA='s'>Edge</PtListItem>
      </PtList>
    </Example>
  )
}

function TableExample() {
  return (
    <Example>
      <Text tag='h3' type='p' size='xxl'>
        Таблицы
      </Text>
      <PtTable spaceA='s' modNames={['spaceA']} tag='table' style={{ width: '100%' }}>
        <thead>
          <PtTableRow view='head' tag='tr'>
            <PtTableCol tag='th' width='50' style={{ textAlign: 'left' }}>
              Месседжер
            </PtTableCol>
            <PtTableCol tag='th' style={{ textAlign: 'left' }}>
              Статус
            </PtTableCol>
          </PtTableRow>
        </thead>
        <tbody>
          <PtTableRow tag='tr'>
            <PtTableCol tag='td' width='50'>
              WhatsApp
            </PtTableCol>
            <PtTableCol tag='td'>Доступен</PtTableCol>
          </PtTableRow>
          <PtTableRow tag='tr' status='alert' mix={[Text, { view: 'alert' }]}>
            <PtTableCol tag='td' width='50'>
              Telegram
            </PtTableCol>
            <PtTableCol tag='td'>Заблокирован</PtTableCol>
          </PtTableRow>
        </tbody>
      </PtTable>
    </Example>
  )
}

function Examples() {
  return (
    <section>
      <Text tag='h2' type='h2' size='xxxl'>
        Примеры
      </Text>
      <TplGrid sRatio='1-1' mRatio='1-1-1' colGap='third' verticalAlign='top' modNames={['sRatio', 'mRatio']}>
        <IconsExample />
        <ListExample />
        <TableExample />
      </TplGrid>
    </section>
  )
}

function App() {
  return (
    <Theme
      breakpoint='default'
      color='whitepaper-default'
      font='ibm'
      gap='large'
      menu='default'
      size='default'
      space='default'
    >
      <TplLayout>
        <TplLayoutContainer size='s' align='center'>
          <About />
          <Examples />
        </TplLayoutContainer>
      </TplLayout>
    </Theme>
  )
}

render(<App />, document.body)
