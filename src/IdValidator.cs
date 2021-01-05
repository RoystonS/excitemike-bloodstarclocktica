using System;
using System.ComponentModel;
using System.Globalization;

namespace BloodstarClocktica
{
    /// <summary>
    /// validator class to make sure we have unique ids
    /// </summary>
    internal class IdValidator : TypeConverter
    {
        public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
        {
            return (sourceType == typeof(string)) || base.CanConvertFrom(context, sourceType);
        }
        public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value)
        {
            if (value is string s)
            {
                if (BC.ValidateId(s, BC.MainForm.CharactersList.SelectedIndex))
                {
                    return s;
                }
                else
                {
                    throw new BC.DuplicateIdException($"character id \"{s}\" is already taken");
                }
            }
            else
            {
                return base.ConvertFrom(context, culture, value);
            }
        }
        public override object ConvertTo(ITypeDescriptorContext context, CultureInfo culture, object value, Type destinationType)
        {
            if (destinationType == typeof(string))
            {
                return value as string;
            }
            return base.ConvertTo(context, culture, value, destinationType);
        }
    }
}
