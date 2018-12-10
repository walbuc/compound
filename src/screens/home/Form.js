/* @jsx jsx */
import {Component} from 'react'
import {jsx} from '@emotion/core'
import {Formik} from 'formik'
import styled from '@emotion/styled'
import axios from 'axios'
import {
  Input,
  Text,
  PrimaryButton,
  IsolatedContainer,
  Section,
} from 'shared/pattern'

const Title = styled(Text)({
  color: 'black',
  marginBottom: 50,
  display: 'flex',
  justifyContent: 'center',
})

const Error = styled(Text)({
  color: 'red',
  display: 'flex',
  justifyContent: 'center',
})
const Success = styled(Text)({color: 'green', textAlign: 'center'})
const FieldError = styled(Text)({color: 'red'})

Error.defaultProps = {size: 'subheading'}
Title.defaultProps = {size: 'superheading'}
FieldError.defaultProps = {size: 'estandar'}
Success.defaultProps = {size: 'subheading'}
const SubmitButton = styled(PrimaryButton)({width: '50%', alignSelf: 'center'})
SubmitButton.defaultProps = {type: 'submit', children: 'Submit!'}

class Form extends Component {
  state = {error: '', success: ''}

  submit = ({firstName, lastName, email}) => {
    axios
      .post('/.netlify/functions/test', {firstName, lastName, email})
      .then(res => this.setState({success: res.data.message, error: ''}))
      .catch(err =>
        this.setState({error: err.response.data.error, success: ''}),
      )
  }
  render() {
    return (
      <IsolatedContainer>
        <Title>Send your Information!</Title>
        {this.state.error && <Error>{this.state.error}</Error>}
        {this.state.success && <Success>{this.state.success}</Success>}
        <Formik
          validate={validate}
          onSubmit={this.submit}
          initialValues={{email: '', firstName: '', lastName: ''}}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
          }) => (
            <form
              css={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 330,
                margin: 'auto',
              }}
              onSubmit={handleSubmit}
            >
              <Section>
                <Input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  placeholder={'email'}
                />
                <FieldError>
                  {errors.email && touched.email && errors.email}
                </FieldError>
              </Section>
              <Input
                type="text"
                name="firstName"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.firstName}
                placeholder={'first name'}
              />
              <FieldError>
                {errors.firstName && touched.firstName && errors.firstName}
              </FieldError>
              <Section>
                <Input
                  type="text"
                  name="lastName"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.lastName}
                  placeholder={'last name'}
                />
                <FieldError>
                  {errors.lastName && touched.lastName && errors.lastName}
                </FieldError>
              </Section>
              <SubmitButton />
            </form>
          )}
        </Formik>
      </IsolatedContainer>
    )
  }
}
const validate = values => {
  let errors = {}
  if (!values.email) {
    errors.email = 'Email field is required.'
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = 'Invalid email address'
  }
  if (!values.firstName) {
    errors.firstName = 'First name field is required.'
  }
  if (!values.lastName) {
    errors.lastName = 'Last name field is required.'
  }
  return errors
}
export default Form
/*
eslint
no-unused-vars: ["warn", {"varsIgnorePattern": "(jsx)"}]
react/react-in-jsx-scope: "off"
*/
