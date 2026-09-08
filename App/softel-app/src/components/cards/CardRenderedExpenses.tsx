import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesTexts } from '@/theme/styles';
import CardOptions from './CardOptions';
import { ExpenseItemResponse } from '@/features/petty-cash/services/pettyCashService';

export interface CardRenderedExpensesProps {
    expenses?: ExpenseItemResponse[];
    totalCount?: number;
    onPressSeeAll?: () => void;
    onPressExpense?: (expense: ExpenseItemResponse) => void;
}

/**
 * Determina el icono según la categoría del gasto.
 */
const getCategoryIcon = (categoryName?: string): keyof typeof Ionicons.glyphMap => {
    if (!categoryName) return 'receipt-outline';
    const cat = categoryName.toLowerCase();
    if (cat.includes('movil') || cat.includes('pasaje') || cat.includes('transporte') || cat.includes('viaje')) {
        return 'bus-outline';
    }
    if (cat.includes('material') || cat.includes('herramienta') || cat.includes('cable') || cat.includes('ferret')) {
        return 'construct-outline';
    }
    if (cat.includes('combus') || cat.includes('gasolina') || cat.includes('petroleo')) {
        return 'car-outline';
    }
    if (cat.includes('viático') || cat.includes('viatico') || cat.includes('alimento') || cat.includes('almuerzo')) {
        return 'restaurant-outline';
    }
    return 'receipt-outline';
};

/**
 * Formatea la fecha a "03 Sep".
 */
const formatExpenseDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    try {
        const clean = dateStr.split('T')[0];
        const parts = clean.split('-');
        if (parts.length < 3) return dateStr;
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parts[2];
        return `${day} ${months[monthIndex] || parts[1]}`;
    } catch {
        return dateStr;
    }
};

/**
 * Componente que muestra el bloque de "Comprobantes Rendidos" con sus estados y montos,
 * reutilizando el patrón y componentes del Home (CardOptions en contenedor surface).
 */
const CardRenderedExpenses: React.FC<CardRenderedExpensesProps> = ({
    expenses = [],
    totalCount,
    onPressSeeAll,
    onPressExpense,
}) => {
    const count = totalCount !== undefined ? totalCount : expenses.length;

    return (
        <View style={{ marginBottom: 16 }}>
            {/* Cabecera: Título con contador y enlace "Ver todos >" */}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                    marginTop: 8,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={stylesTexts.titleHome}>Comprobantes Rendidos</Text>
                    <View
                        style={{
                            backgroundColor: '#E4E4E7',
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            marginLeft: 8,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
                            {count}
                        </Text>
                    </View>
                </View>

                {onPressSeeAll && (
                    <TouchableOpacity
                        onPress={onPressSeeAll}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                            Ver todos {'>'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Contenedor idéntico al bloque del Home (HomeOperatorScreen:L28) */}
            <View
                style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    paddingHorizontal: 15,
                    paddingBottom: 10,
                }}
            >
                {expenses.length === 0 ? (
                    <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                        <Ionicons name="receipt-outline" size={32} color={colors.textDisabled} />
                        <Text style={[stylesTexts.subtitle, { marginTop: 8, marginBottom: 0 }]}>
                            No hay comprobantes rendidos aún
                        </Text>
                    </View>
                ) : (
                    expenses.map((item, index) => {
                        const dateFormatted = formatExpenseDate(item.expenseDate);
                        const categoryName = item.category?.name || 'Comprobante';
                        const subtitle = dateFormatted ? `${dateFormatted} • ${categoryName}` : categoryName;

                        return (
                            <CardOptions
                                key={item.id}
                                title={item.reason}
                                subtitle={subtitle}
                                iconName={getCategoryIcon(item.category?.name)}
                                amount={item.amount}
                                status={item.status}
                                isLast={index === expenses.length - 1}
                                onPress={() => onPressExpense?.(item)}
                            />
                        );
                    })
                )}
            </View>
        </View>
    );
};

export default CardRenderedExpenses;
